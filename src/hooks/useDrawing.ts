import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useStore } from '../store'
import { DrawingMode, MapFeature } from '../types'
import {
  createPolygonFromPoints,
  createRectangleFromBounds,
  createCircle,
  createLineString,
  checkPolygonOverlap,
  trimPolygonOverlap,
  calculateDistance,
  generateId,
  createFeature,
} from '../utils/geometry'
import * as turf from '@turf/turf'

export function useDrawing() {
  const map = useMap()
  const { mode, features, setTempFeature, addFeature } = useStore()
  const drawingRef = useRef<{
    startPoint: L.LatLng | null
    currentPoints: [number, number][]
    isDrawing: boolean
    marker: L.Marker | null
    circle: L.Circle | null
    rectangle: L.Rectangle | null
    polyline: L.Polyline | null
    polygon: L.Polygon | null
  }>({
    startPoint: null,
    currentPoints: [],
    isDrawing: false,
    marker: null,
    circle: null,
    rectangle: null,
    polyline: null,
    polygon: null,
  })

  const cleanup = () => {
    if (drawingRef.current.marker) {
      map.removeLayer(drawingRef.current.marker)
      drawingRef.current.marker = null
    }
    if (drawingRef.current.circle) {
      map.removeLayer(drawingRef.current.circle)
      drawingRef.current.circle = null
    }
    if (drawingRef.current.rectangle) {
      map.removeLayer(drawingRef.current.rectangle)
      drawingRef.current.rectangle = null
    }
    if (drawingRef.current.polyline) {
      map.removeLayer(drawingRef.current.polyline)
      drawingRef.current.polyline = null
    }
    if (drawingRef.current.polygon) {
      map.removeLayer(drawingRef.current.polygon)
      drawingRef.current.polygon = null
    }
    drawingRef.current.startPoint = null
    drawingRef.current.currentPoints = []
    drawingRef.current.isDrawing = false
    setTempFeature(null)
  }

  useEffect(() => {
    if (!mode) {
      cleanup()
      return
    }

    const updatePreview = (latlng: L.LatLng) => {
      if (!drawingRef.current.isDrawing || !drawingRef.current.startPoint) return

      const start = drawingRef.current.startPoint

      if (mode === 'circle') {
        const distance = calculateDistance([start.lat, start.lng], [latlng.lat, latlng.lng])
        if (drawingRef.current.circle) {
          map.removeLayer(drawingRef.current.circle)
        }
        const circle = L.circle(start, {
          radius: distance * 1000,
          color: '#3388ff',
          fillColor: '#3388ff',
          fillOpacity: 0.2,
          weight: 2,
        }).addTo(map)
        drawingRef.current.circle = circle
      } else if (mode === 'rectangle') {
        const bounds = L.latLngBounds(start, latlng)
        if (drawingRef.current.rectangle) {
          map.removeLayer(drawingRef.current.rectangle)
        }
        const rectangle = L.rectangle(bounds, {
          color: '#3388ff',
          fillColor: '#3388ff',
          fillOpacity: 0.2,
          weight: 2,
        }).addTo(map)
        drawingRef.current.rectangle = rectangle
      }
    }

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const latlng = e.latlng
      const coords: [number, number] = [latlng.lat, latlng.lng]

      if (mode === 'circle' || mode === 'rectangle') {
        if (!drawingRef.current.isDrawing) {
          drawingRef.current.startPoint = latlng
          drawingRef.current.isDrawing = true
          drawingRef.current.currentPoints = [coords]

          const marker = L.marker(latlng, {
            icon: L.divIcon({
              className: 'draw-marker',
              html: '<div style="width: 12px; height: 12px; background: #3388ff; border: 2px solid white; border-radius: 50%;"></div>',
              iconSize: [12, 12],
            }),
          }).addTo(map)
          drawingRef.current.marker = marker
        } else {
          const start = drawingRef.current.startPoint!
          const distance = calculateDistance(
            [start.lat, start.lng],
            [latlng.lat, latlng.lng]
          )

          if (mode === 'circle') {
            const circleGeo = createCircle([start.lat, start.lng] as [number, number], distance)
            const existingPolygons = features
              .filter((f) => f.properties.type !== 'lineString')
              .map((f) => turf.feature(f.geometry as any))

            const overlap = checkPolygonOverlap(circleGeo, existingPolygons)

            if (overlap.fullyEnclosed) {
              alert('Cannot draw: This shape fully encloses or is fully enclosed by an existing shape')
              cleanup()
              return
            }

            if (overlap.overlaps) {
              const trimmed = trimPolygonOverlap(circleGeo, existingPolygons)
              if (trimmed) {
                const feature = createFeature(trimmed, mode) as MapFeature
                feature.id = generateId()
                addFeature(feature)
              }
            } else {
              const feature = createFeature(circleGeo, mode) as MapFeature
              feature.id = generateId()
              addFeature(feature)
            }

            cleanup()
          } else if (mode === 'rectangle') {
            const bounds = L.latLngBounds(start, latlng)
            const rectGeo = createRectangleFromBounds(
              bounds.getNorth(),
              bounds.getSouth(),
              bounds.getEast(),
              bounds.getWest()
            )
            const existingPolygons = features
              .filter((f) => f.properties.type !== 'lineString')
              .map((f) => turf.feature(f.geometry as any))

            const overlap = checkPolygonOverlap(rectGeo, existingPolygons)

            if (overlap.fullyEnclosed) {
              alert('Cannot draw: This shape fully encloses or is fully enclosed by an existing shape')
              cleanup()
              return
            }

            if (overlap.overlaps) {
              const trimmed = trimPolygonOverlap(rectGeo, existingPolygons)
              if (trimmed) {
                const feature = createFeature(trimmed, mode) as MapFeature
                feature.id = generateId()
                addFeature(feature)
              }
            } else {
              const feature = createFeature(rectGeo, mode) as MapFeature
              feature.id = generateId()
              addFeature(feature)
            }

            cleanup()
          }
        }
      } else if (mode === 'polygon') {
        drawingRef.current.currentPoints.push(coords)

        if (drawingRef.current.polygon) {
          map.removeLayer(drawingRef.current.polygon)
        }

        if (drawingRef.current.currentPoints.length >= 3) {
          const polygonGeo = createPolygonFromPoints(drawingRef.current.currentPoints)
          const polygon = L.polygon(
            drawingRef.current.currentPoints.map((p) => [p[0], p[1]]),
            {
              color: '#3388ff',
              fillColor: '#3388ff',
              fillOpacity: 0.2,
              weight: 2,
            }
          ).addTo(map)
          drawingRef.current.polygon = polygon
        }
      } else if (mode === 'lineString') {
        drawingRef.current.currentPoints.push(coords)

        if (drawingRef.current.polyline) {
          map.removeLayer(drawingRef.current.polyline)
        }

        const polyline = L.polyline(
          drawingRef.current.currentPoints.map((p) => [p[0], p[1]]),
          {
            color: '#3388ff',
            weight: 3,
          }
        ).addTo(map)
        drawingRef.current.polyline = polyline
      }
    }

    const handleMapDblClick = (e: L.LeafletMouseEvent) => {
      if (mode === 'polygon' && drawingRef.current.currentPoints.length >= 3) {
        const polygonGeo = createPolygonFromPoints(drawingRef.current.currentPoints)
        const existingPolygons = features
          .filter((f) => f.properties.type !== 'lineString')
          .map((f) => turf.feature(f.geometry as any))

        const overlap = checkPolygonOverlap(polygonGeo, existingPolygons)

        if (overlap.fullyEnclosed) {
          alert('Cannot draw: This shape fully encloses or is fully enclosed by an existing shape')
          cleanup()
          return
        }

        if (overlap.overlaps) {
          const trimmed = trimPolygonOverlap(polygonGeo, existingPolygons)
          if (trimmed) {
            const feature = createFeature(trimmed, mode) as MapFeature
            feature.id = generateId()
            addFeature(feature)
          }
        } else {
          const feature = createFeature(polygonGeo, mode) as MapFeature
          feature.id = generateId()
          addFeature(feature)
        }

        cleanup()
      } else if (mode === 'lineString' && drawingRef.current.currentPoints.length >= 2) {
        const lineGeo = createLineString(drawingRef.current.currentPoints)
        const feature = createFeature(lineGeo, mode) as MapFeature
        feature.id = generateId()
        addFeature(feature)
        cleanup()
      }
    }

    const handleMapMove = (e: L.LeafletMouseEvent) => {
      if (drawingRef.current.isDrawing && (mode === 'circle' || mode === 'rectangle')) {
        updatePreview(e.latlng)
      }
    }

    map.on('click', handleMapClick)
    map.on('dblclick', handleMapDblClick)
    map.on('mousemove', handleMapMove)

    return () => {
      map.off('click', handleMapClick)
      map.off('dblclick', handleMapDblClick)
      map.off('mousemove', handleMapMove)
      cleanup()
    }
  }, [mode, map, features, setTempFeature, addFeature])

  return null
}
