'use client'

import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fotoğraflı marker - Apple Photos harita tarzı
const createPhotoIcon = (photoUrl?: string) => {
  const size = 44
  if (photoUrl) {
    return new L.DivIcon({
      className: 'custom-marker-photo',
      html: `<div style="
        width: ${size}px; height: ${size}px;
        border-radius: 50%;
        border: 3px solid #d2b96e;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 12px rgba(179, 147, 69, 0.4);
        overflow: hidden;
        background: #1a1a1a;
      "><img src="${photoUrl}" style="
        width: 100%; height: 100%;
        object-fit: cover;
        display: block;
      " /></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -(size / 2 + 4)],
    })
  }
  // Fotoğraf yoksa gold nokta
  return new L.DivIcon({
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
}

// Cluster icon - birden fazla proje üst üsteyken sayı + fotoğraf stack
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount()
  const markers = cluster.getAllChildMarkers()

  // İlk 3 projenin fotoğrafını al (stack efekti için)
  const photos: string[] = []
  for (const m of markers) {
    const src = m?.options?.icon?.options?.html?.match(/src="([^"]+)"/)
    if (src && src[1] && photos.length < 3) photos.push(src[1])
  }

  let size = 52
  if (count >= 10) size = 58
  if (count >= 50) size = 66

  // Fotoğraf varsa stack göster
  if (photos.length > 0) {
    const stackHtml = photos.length >= 2
      ? `<div style="
          position: absolute; top: -4px; left: -4px;
          width: ${size - 8}px; height: ${size - 8}px;
          border-radius: 50%; border: 2px solid rgba(210, 185, 110, 0.4);
          overflow: hidden; transform: rotate(-8deg);
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        "><img src="${photos[1]}" style="width:100%;height:100%;object-fit:cover;" /></div>`
      : ''

    return new L.DivIcon({
      html: `<div style="position:relative; width:${size}px; height:${size}px;">
        ${stackHtml}
        <div style="
          position: absolute; top: 2px; left: 4px;
          width: ${size - 8}px; height: ${size - 8}px;
          border-radius: 50%; border: 3px solid #d2b96e;
          overflow: hidden; z-index: 2;
          box-shadow: 0 2px 10px rgba(0,0,0,0.5), 0 0 12px rgba(179, 147, 69, 0.3);
        "><img src="${photos[0]}" style="width:100%;height:100%;object-fit:cover;" /></div>
        <div style="
          position: absolute; bottom: -6px; right: -6px; z-index: 3;
          min-width: 22px; height: 22px; padding: 0 6px;
          border-radius: 11px;
          background: linear-gradient(135deg, #d2b96e, #b39345);
          border: 2px solid #0a0a0a;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center;
          color: #0a0a0a; font-weight: 700; font-size: 11px;
          font-family: 'Inter', sans-serif;
        ">${count}</div>
      </div>`,
      className: 'custom-cluster-marker',
      iconSize: new L.Point(size + 8, size + 8),
      iconAnchor: new L.Point((size + 8) / 2, (size + 8) / 2),
    })
  }

  // Fotoğraf yoksa sadece gold sayı dairesi
  return new L.DivIcon({
    html: `<div style="
      width: ${size}px; height: ${size}px;
      background: radial-gradient(circle, #d2b96e 0%, #b39345 60%, #82692e 100%);
      border: 2px solid #d2b96e;
      border-radius: 50%;
      box-shadow: 0 0 20px rgba(179, 147, 69, 0.6), 0 0 40px rgba(179, 147, 69, 0.2);
      display: flex; align-items: center; justify-content: center;
      color: #0a0a0a; font-weight: 700; font-size: 14px;
      font-family: 'Inter', sans-serif;
    ">${count}</div>`,
    className: 'custom-cluster-marker',
    iconSize: new L.Point(size, size),
    iconAnchor: new L.Point(size / 2, size / 2),
  })
}

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

interface MapLabels {
  details: string
  navigate: string
}

export default function ProjectMap({ locations, labels }: { locations: Location[]; labels?: MapLabels }) {
  const detailsText = labels?.details || 'Detayları Gör →'
  const navigateText = labels?.navigate || 'Konuma Git'
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
      <MarkerClusterGroup
        iconCreateFunction={createClusterCustomIcon}
        maxClusterRadius={60}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
        animate={true}
        animateAddingMarkers={true}
        disableClusteringAtZoom={13}
      >
        {locations.map((loc, i) => (
          <Marker key={loc.id || i} position={[loc.lat, loc.lng]} icon={createPhotoIcon(loc.photos?.[0])}>
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
                position: 'relative',
              }}>
                {/* Custom close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    let el = e.currentTarget as HTMLElement | null
                    while (el && !el.classList.contains('leaflet-popup')) {
                      el = el.parentElement
                    }
                    if (el) {
                      const closeBtn = el.querySelector('a.leaflet-popup-close-button') as HTMLElement
                      if (closeBtn) closeBtn.click()
                    }
                  }}
                  style={{
                    position: 'absolute', top: '10px', right: '10px', zIndex: 10,
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white', fontSize: '20px', fontWeight: 300,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
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
                        {detailsText} →
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
                      🗺️ {navigateText}
                    </a>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
