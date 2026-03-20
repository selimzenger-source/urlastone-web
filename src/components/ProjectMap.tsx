'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Mobilde Leaflet tap handler sorun çıkarıyor — devre dışı bırak
function MobileTapFix() {
  const map = useMap()
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = map as any
    if (m.tap) m.tap.disable()
    map.getContainer().style.touchAction = 'manipulation'
  }, [map])
  return null
}

// Icon cache — 500+ projede performans için
const iconCache = new Map<string, L.DivIcon>()

const createPhotoIcon = (photoUrl?: string) => {
  const cacheKey = photoUrl || '__no_photo__'
  const cached = iconCache.get(cacheKey)
  if (cached) return cached

  const size = 56
  let icon: L.DivIcon

  if (photoUrl) {
    icon = new L.DivIcon({
      className: 'custom-marker-photo',
      html: `<div style="
        width: ${size}px; height: ${size}px;
        border-radius: 50%;
        border: 3px solid #d2b96e;
        box-shadow: 0 2px 12px rgba(0,0,0,0.6), 0 0 16px rgba(179, 147, 69, 0.5);
        overflow: hidden;
        background: #1a1a1a;
        pointer-events: none;
      "><img src="${photoUrl}" style="
        width: 100%; height: 100%;
        object-fit: cover;
        display: block;
        pointer-events: none;
      " /></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    })
  } else {
    icon = new L.DivIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 24px; height: 24px;
        background: #b39345;
        border: 2px solid #d2b96e;
        border-radius: 50%;
        box-shadow: 0 0 12px rgba(179, 147, 69, 0.5);
        pointer-events: none;
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  }

  iconCache.set(cacheKey, icon)
  return icon
}

// Cluster icon
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount()
  const markers = cluster.getAllChildMarkers()

  const photos: string[] = []
  for (const m of markers) {
    const src = m?.options?.icon?.options?.html?.match(/src="([^"]+)"/)
    if (src && src[1] && photos.length < 3) photos.push(src[1])
  }

  let size = 64
  if (count >= 10) size = 72
  if (count >= 50) size = 80

  if (photos.length > 0) {
    const stackHtml = photos.length >= 2
      ? `<div style="
          position: absolute; top: -4px; left: -4px;
          width: ${size - 8}px; height: ${size - 8}px;
          border-radius: 50%; border: 2px solid rgba(210, 185, 110, 0.4);
          overflow: hidden; transform: rotate(-8deg);
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          pointer-events: none;
        "><img src="${photos[1]}" style="width:100%;height:100%;object-fit:cover;pointer-events:none;" /></div>`
      : ''

    return new L.DivIcon({
      html: `<div style="position:relative; width:${size}px; height:${size}px; pointer-events:none;">
        ${stackHtml}
        <div style="
          position: absolute; top: 2px; left: 4px;
          width: ${size - 8}px; height: ${size - 8}px;
          border-radius: 50%; border: 3px solid #d2b96e;
          overflow: hidden; z-index: 2;
          box-shadow: 0 2px 10px rgba(0,0,0,0.5), 0 0 12px rgba(179, 147, 69, 0.3);
          pointer-events: none;
        "><img src="${photos[0]}" style="width:100%;height:100%;object-fit:cover;pointer-events:none;" /></div>
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
          pointer-events: none;
        ">${count}</div>
      </div>`,
      className: 'custom-cluster-marker',
      iconSize: new L.Point(size + 8, size + 8),
      iconAnchor: new L.Point((size + 8) / 2, (size + 8) / 2),
    })
  }

  return new L.DivIcon({
    html: `<div style="
      width: ${size}px; height: ${size}px;
      background: radial-gradient(circle, #d2b96e 0%, #b39345 60%, #82692e 100%);
      border: 2px solid #d2b96e;
      border-radius: 50%;
      box-shadow: 0 0 20px rgba(179, 147, 69, 0.6), 0 0 40px rgba(179, 147, 69, 0.2);
      pointer-events: none;
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

// Fotoğraf slider — kart içinde
function PhotoSlider({ photos, alt }: { photos: string[]; alt: string }) {
  const [current, setCurrent] = useState(0)
  if (!photos.length) return null

  return (
    <div style={{ width: '100%', height: '200px', position: 'relative', overflow: 'hidden' }}>
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
  const detailsText = labels?.details || 'Detayları Gör'
  const navigateText = labels?.navigate || 'Konuma Git'
  const [selected, setSelected] = useState<Location | null>(null)

  const markerIcons = useMemo(() => {
    return locations.map(loc => createPhotoIcon(loc.photos?.[0]))
  }, [locations])

  // Marker tıklanınca — Leaflet Popup yerine kendi kartımızı göster
  const handleMarkerClick = useCallback((loc: Location) => {
    setSelected(loc)
  }, [])

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={[39.0, 35.0]}
        zoom={6}
        minZoom={5}
        maxZoom={15}
        style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
        zoomControl={true}
        attributionControl={false}
      >
        <MobileTapFix />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MarkerClusterGroup
          iconCreateFunction={createClusterCustomIcon}
          maxClusterRadius={80}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          animate={true}
          animateAddingMarkers={false}
          disableClusteringAtZoom={14}
          spiderfyDistanceMultiplier={2}
          chunkedLoading={true}
          chunkInterval={200}
          chunkDelay={50}
          removeOutsideVisibleBounds={true}
        >
          {locations.map((loc, i) => (
            <Marker
              key={loc.id || i}
              position={[loc.lat, loc.lng]}
              icon={markerIcons[i]}
              eventHandlers={{
                click: () => handleMarkerClick(loc),
              }}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Proje Kartı — Leaflet Popup yerine kendi React overlay'imiz */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'absolute', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%', maxWidth: '400px',
              background: '#1a1a1a',
              borderRadius: '16px 16px 0 0',
              border: '1px solid rgba(179, 147, 69, 0.3)',
              borderBottom: 'none',
              fontFamily: 'Inter, sans-serif',
              overflow: 'hidden',
              animation: 'slideUp 0.3s ease-out',
              maxHeight: '80%',
              overflowY: 'auto',
            }}
          >
            {/* Photo Slider */}
            {selected.photos && selected.photos.length > 0 && (
              <div style={{ position: 'relative' }}>
                <PhotoSlider photos={selected.photos} alt={selected.project_name || selected.city} />
                {/* Close button — fotoğrafın sağ üstünde */}
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    position: 'absolute', top: '10px', right: '10px', zIndex: 10,
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white', fontSize: '18px', fontWeight: 300,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            {/* Fotoğraf yoksa close button */}
            {(!selected.photos || selected.photos.length === 0) && (
              <button
                onClick={() => setSelected(null)}
                style={{
                  position: 'absolute', top: '10px', right: '10px', zIndex: 10,
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white', fontSize: '18px', fontWeight: 300,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            )}

            <div style={{ padding: '14px 16px 20px' }}>
              {/* Project Name */}
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', color: 'white' }}>
                {selected.project_name || selected.city}
              </div>
              {/* City & Category */}
              <div style={{ fontSize: '12px', color: '#b39345', fontWeight: 600, marginBottom: '8px' }}>
                {selected.city}{selected.category ? ` · ${selected.category}` : ''}
              </div>
              {/* Description — tam metin */}
              {selected.description && (
                <div style={{
                  fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '10px',
                  lineHeight: '1.6',
                }}>
                  {selected.description}
                </div>
              )}
              {/* Address */}
              {selected.address && (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>
                  📍 {selected.address}
                </div>
              )}
              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selected.id && (
                  <a
                    href={`/uygulamalarimiz/${selected.id}`}
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
                  href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`}
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
        </div>
      )}
    </div>
  )
}
