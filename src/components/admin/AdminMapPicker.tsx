'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const goldIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 28px; height: 28px;
    background: #b39345;
    border: 3px solid #d2b96e;
    border-radius: 50%;
    box-shadow: 0 0 16px rgba(179, 147, 69, 0.6);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface Props {
  lat: number
  lng: number
  onSelect: (lat: number, lng: number) => void
}

export default function AdminMapPicker({ lat, lng, onSelect }: Props) {
  return (
    <MapContainer
      center={[lat || 39.0, lng || 35.0]}
      zoom={lat ? 10 : 6}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      <ClickHandler onSelect={onSelect} />
      {lat && lng && (
        <Marker position={[lat, lng]} icon={goldIcon} />
      )}
    </MapContainer>
  )
}
