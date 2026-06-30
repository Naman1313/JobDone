"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPickerProps {
  initialPosition: [number, number];
  onSelect: (position: [number, number]) => void;
}

// Custom Premium Pin Icon
const customIcon = new L.DivIcon({
  className: 'custom-pin',
  html: `
    <div style="
      width: 32px; 
      height: 32px; 
      background: #5D4037; 
      border-radius: 50% 50% 50% 0; 
      transform: rotate(-45deg); 
      box-shadow: 0 4px 12px rgba(93,64,55,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
    ">
      <div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32], // Anchor at the bottom point
});

function LocationMarker({ position, setPosition, onSelect }: any) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onSelect([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon}></Marker>
  );
}

export default function MapPicker({ initialPosition, onSelect }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number]>(initialPosition);

  // Fix leaflet map sizing issues when rendering inside a modal
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-border-subtle/50 relative z-0">
      <MapContainer 
        center={initialPosition} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} onSelect={onSelect} />
      </MapContainer>
    </div>
  );
}
