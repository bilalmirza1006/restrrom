'use client';

import L from 'leaflet';
import { useEffect, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapContainer, Marker, TileLayer, Popup, useMap } from 'react-leaflet';
import { FaBuilding } from 'react-icons/fa';
import Button from '@/components/global/small/Button';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
// ---------- Custom Building Icon ----------
const iconMarkup = renderToStaticMarkup(
  <FaBuilding style={{ color: '#2563eb', fontSize: '28px' }} />
);

const buildingIcon = L.divIcon({
  html: iconMarkup,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -28],
});

// ---------- Auto Center Map ----------
const FitBounds = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points, map]);

  return null;
};

// ---------- Geocoding (fallback only) ----------
const getCoordinates = async locationName => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        locationName
      )}&limit=1`
    );
    const data = await res.json();

    if (data?.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (err) {
    console.error('Geocoding error:', err);
  }
  return null;
};

// ---------- Main Component ----------
const BuildingMap = ({ locationData = [], user, loading = false }) => {
  const [markers, setMarkers] = useState([]);

  // ---------- Keep all your existing functions as-is ----------
  const getRouteByRole = (role, buildingId) => {
    switch (role) {
      case 'admin':
        return `/admin/buildings/building-detail/${buildingId}`;
      case 'building_inspector':
        return `/inspectionist/checkinlist/${buildingId}`;
      case 'super_admin':
        return `/super-admin/buildings/building-details/${buildingId}`;
      default:
        return '';
    }
  };

  useEffect(() => {
    if (loading) return; // skip marker resolution if loading

    const resolveLocations = async () => {
      const resolved = await Promise.all(
        locationData.map(async item => {
          if (typeof item.latitude === 'number' && typeof item.longitude === 'number') {
            return { ...item, position: [item.latitude, item.longitude] };
          }
          if (item.locationName) {
            const coords = await getCoordinates(item.locationName);
            if (coords) return { ...item, position: coords };
          }
          return null;
        })
      );
      setMarkers(resolved.filter(Boolean));
    };

    resolveLocations();
  }, [locationData, loading]);

  if (typeof window === 'undefined') return null;

  // ---------- Skeleton Loading ----------
  if (loading) {
    return (
      <div className="flex h-75 w-full items-center justify-center md:h-112.5">
        <Skeleton width="100%" height="100%" />
      </div>
    );
  }

  // ---------- Normal Map Rendering ----------
  return (
    <div className="h-75 w-full rounded-2xl md:h-112.5">
      <MapContainer
        center={[30.3753, 69.3451]} // Pakistan center
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', borderRadius: '16px' }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <FitBounds points={markers.map(m => m.position)} />
        {markers.map(item => (
          <Marker key={item.buildingId} position={item.position} icon={buildingIcon}>
            <Popup maxWidth={220}>
              <div className="space-y-2">
                <img
                  src={item.buildingThumbnail}
                  alt={item.locationName}
                  className="h-28 w-full rounded object-cover"
                />
                <p className="text-sm font-semibold">{item.locationName}</p>
                <Button
                  text="View Building"
                  size="sm"
                  onClick={() => {
                    const url = getRouteByRole(user?.role, item.buildingId);
                    window.location.href = url;
                  }}
                  fullWidth
                />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BuildingMap;
