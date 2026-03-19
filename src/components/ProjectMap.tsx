'use client'

import { useState } from 'react'
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

function PhotoSlider({ photos, alt }: { photos: string[]; alt: string }) {
  const [current, setCurrent] = useState(0)

  if (!photos.length) return null

  return (
    <div style={{ width: '100%', height: '220px', position: 'relative', overflow: 'hidden' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[current]}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }}
      />
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + photos.length) % photos.length) }}
            style={{
              position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)',
              width: '28px', height: '28px', borderRadius: '50%', border: 'none',
              background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '14px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % photos.length) }}
            style={{
              position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
              width: '28px', height: '28px', borderRadius: '50%', border: 'none',
              background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '14px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ›
          </button>
          <div style={{
            position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '4px',
          }}>
            {photos.map((_, i) => (
              <div
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
                style={{
                  width: i === current ? '16px' : '6px', height: '6px',
                  borderRadius: '3px', cursor: 'pointer', transition: 'all 0.3s',
                  background: i === current ? '#b39345' : 'rgba(255,255,255,0.4)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
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
              borderRadius: '14px',
              border: '1px solid rgba(179, 147, 69, 0.3)',
              minWidth: '300px',
              maxWidth: '340px',
              fontFamily: 'Inter, sans-serif',
              overflow: 'hidden',
            }}>
              {/* Photo Slider */}
              {loc.photos && loc.photos.length > 0 && (
                <PhotoSlider photos={loc.photos} alt={loc.project_name || loc.city} />
              )}
              <div style={{ padding: '14px 16px' }}>
                {/* Project Name */}
                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
                  {loc.project_name || loc.city}
                </div>
                {/* City & Category */}
                <div style={{ fontSize: '12px', color: '#b39345', fontWeight: 600, marginBottom: '8px' }}>
                  {loc.city}{loc.category ? ` · ${loc.category}` : ''}
                </div>
                {/* Description - max 2 lines */}
                {loc.description && (
                  <div style={{
                    fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '10px',
                    lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {loc.description}
                  </div>
                )}
                {/* Address */}
                {loc.address && (
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>
                    📍 {loc.address}
                  </div>
                )}
                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {loc.id && (
                    <a
                      href={`/uygulamalarimiz/${loc.id}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '20px',
                        background: 'rgba(255, 255, 255, 0.08)', color: 'white',
                        fontSize: '12px', fontWeight: 600, textDecoration: 'none',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                      }}
                    >
                      Detayları Gör →
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '20px',
                      background: 'rgba(179, 147, 69, 0.15)', color: '#b39345',
                      fontSize: '12px', fontWeight: 600, textDecoration: 'none',
                      border: '1px solid rgba(179, 147, 69, 0.25)',
                    }}
                  >
                    🗺️ Konuma Git
                  </a>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
