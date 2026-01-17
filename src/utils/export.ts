import { MapFeature } from '../types'
import { FeatureCollection } from 'geojson'

export function exportToGeoJSON(features: MapFeature[]) {
  const featureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: features.map((f) => ({
      type: 'Feature',
      geometry: f.geometry,
      properties: {
        type: f.properties.type,
        createdAt: f.properties.createdAt,
      },
    })),
  }

  const jsonString = JSON.stringify(featureCollection, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `map-features-${Date.now()}.geojson`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
