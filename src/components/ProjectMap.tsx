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
  id?: string
  city: string
  lat: number
  lng: number
  project_name?: string
  address?: string | null
  description?: string | null
  category?: string
  photos?: string[]
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
        <Marker key={loc.id || i} position={[loc.lat, loc.lng]} icon={goldIcon}>
          <Popup>
            <div style={{
              background: '#1a1a1a',
              color: 'white',
              padding: '0',
              borderRadius: '12px',
              border: '1px solid rgba(179, 147, 69, 0.3)',
              minWidth: '220px',
              maxWidth: '280px',
              fontFamily: 'Inter, sans-serif',
              overflow: 'hidden',
            }}>
              {/* Photo */}
              {loc.photos && loc.photos[0] && (
                <div style={{ width: '100%', height: '120px', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={loc.photos[0]}
                    alt={loc.project_name || loc.city}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              <div style={{ padding: '12px 14px' }}>
                {/* Project Name */}
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '2px' }}>
                  {loc.project_name || loc.city}
                </div>
                {/* City & Category */}
                <div style={{ fontSize: '11px', color: '#b39345', fontWeight: 600, marginBottom: '6px' }}>
                  {loc.city}{loc.category ? ` · ${loc.category}` : ''}
                </div>
                {/* Description */}
                {loc.description && (
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px', lineHeight: '1.4' }}>
                    {loc.description}
                  </div>
                )}
                {/* Address + Navigate */}
                {loc.address && (
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>
                    📍 {loc.address}
                  </div>
                )}
                {/* Google Maps link */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: 'rgba(179, 147, 69, 0.15)',
                    color: '#b39345',
                    fontSize: '11px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    border: '1px solid rgba(179, 147, 69, 0.25)',
                  }}
                >
                  🗺️ Konuma Git
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
