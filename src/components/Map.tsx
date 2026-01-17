import { useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import { useStore } from '../store'
import { useDrawing } from '../hooks/useDrawing'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function MapContent() {
  useDrawing()
  return null
}

export default function Map() {
  const { features } = useStore()

  const getStyle = (feature: any) => {
    const type = feature.properties.type
    if (type === 'lineString') {
      return {
        color: '#3388ff',
        weight: 3,
        opacity: 0.8,
      }
    }
    return {
      color: '#3388ff',
      fillColor: '#3388ff',
      fillOpacity: 0.2,
      weight: 2,
      opacity: 0.8,
    }
  }

  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapContent />
      {features.map((feature) => (
        <GeoJSON
          key={feature.id}
          data={feature}
          style={getStyle(feature)}
        />
      ))}
    </MapContainer>
  )
}
