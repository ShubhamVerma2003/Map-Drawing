import * as turf from '@turf/turf'
import { Feature, Polygon, LineString, Point } from 'geojson'
import { DrawingMode } from '../types'

export function createPolygonFromPoints(points: [number, number][]): Polygon {
  if (points.length < 3) {
    return {
      type: 'Polygon',
      coordinates: [[]],
    }
  }
  const closed = [...points.map(([lat, lng]) => [lng, lat] as [number, number]), points.map(([lat, lng]) => [lng, lat] as [number, number])[0]]
  return {
    type: 'Polygon',
    coordinates: [closed],
  }
}

export function createRectangleFromBounds(
  north: number,
  south: number,
  east: number,
  west: number
): Polygon {
  return {
    type: 'Polygon',
    coordinates: [
      [
        [west, north],
        [east, north],
        [east, south],
        [west, south],
        [west, north],
      ],
    ],
  }
}

export function createCircle(
  center: [number, number],
  radiusKm: number,
  steps: number = 64
): Polygon {
  const [lat, lng] = center
  const circle = turf.circle([lng, lat], radiusKm, { steps })
  return circle.geometry as Polygon
}

export function createLineString(points: [number, number][]): LineString {
  return {
    type: 'LineString',
    coordinates: points.map(([lat, lng]) => [lng, lat] as [number, number]),
  }
}

export function checkPolygonOverlap(
  newPolygon: Polygon,
  existingPolygons: Feature<Polygon>[]
): { overlaps: boolean; fullyEnclosed: boolean } {
  const newFeature = turf.polygon(newPolygon.coordinates)

  for (const existing of existingPolygons) {
    const existingPoly = turf.polygon(existing.geometry.coordinates)
    const intersection = turf.intersect(newFeature, existingPoly)

    if (intersection) {
      const newArea = turf.area(newFeature)
      const intersectionArea = turf.area(intersection)
      const existingArea = turf.area(existingPoly)

      if (Math.abs(intersectionArea - newArea) < 0.0001) {
        return { overlaps: true, fullyEnclosed: true }
      }

      if (Math.abs(intersectionArea - existingArea) < 0.0001) {
        return { overlaps: true, fullyEnclosed: true }
      }

      return { overlaps: true, fullyEnclosed: false }
    }
  }

  return { overlaps: false, fullyEnclosed: false }
}

export function trimPolygonOverlap(
  newPolygon: Polygon,
  existingPolygons: Feature<Polygon>[]
): Polygon | null {
  let result: turf.Feature<turf.Polygon> | null = turf.polygon(newPolygon.coordinates)

  for (const existing of existingPolygons) {
    const existingPoly = turf.polygon(existing.geometry.coordinates)
    const difference = turf.difference(result, existingPoly)

    if (!difference || difference.geometry.type !== 'Polygon') {
      return null
    }

    result = difference as turf.Feature<turf.Polygon>
  }

  if (!result || result.geometry.type !== 'Polygon') {
    return null
  }

  return result.geometry
}

export function calculateDistance(
  point1: [number, number],
  point2: [number, number]
): number {
  const [lat1, lng1] = point1
  const [lat2, lng2] = point2
  return turf.distance([lng1, lat1], [lng2, lat2], { units: 'kilometers' })
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export function createFeature(
  geometry: Polygon | LineString,
  type: DrawingMode
): Feature {
  return {
    type: 'Feature',
    geometry,
    properties: {
      type,
      createdAt: Date.now(),
    },
  }
}
