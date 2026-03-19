'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom gold marker
const goldIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 24px; height: 24px;
    background: #b39345;
    border: 2px solid #d2b96e;
    border-radius: 50%;
    box-shadow: 0 0 12px rgba(179, 147, 69, 0.5);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
})

interface Location {
  city: string
  lat: number
  lng: number
  projects: number
  desc: string
}

export default function ProjectMap({ locations }: { locations: Location[] }) {
  return (
    <MapContainer
      center={[39.0, 35.0]}
      zoom={6}
      minZoom={5}
      maxZoom={15}
      style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {locations.map((loc, i) => (
        <Marker key={i} position={[loc.lat, loc.lng]} icon={goldIcon}>
          <Popup>
            <div style={{
              background: '#1a1a1a',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(179, 147, 69, 0.3)',
              minWidth: '180px',
              fontFamily: 'Inter, sans-serif',
            }}>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{loc.city}</div>
              <div style={{ fontSize: '11px', color: '#b39345', fontWeight: 600, marginBottom: '6px' }}>
                {loc.projects} Proje
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{loc.desc}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
