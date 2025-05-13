'use client';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const iconMarkup = renderToStaticMarkup(
  <FaMapMarkerAlt style={{ color: 'red', fontSize: '2rem' }} />
);
const customDivIcon = L.divIcon({
  html: iconMarkup,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const Map = ({ lat, lng }) => {
  const [position, setPosition] = useState(null);
  const MapClickHandler = () => {
    useMapEvents({
      click() {
        this.locate();
      },
      locationfound(e) {
        setPosition(e.latlng);
        this.flyTo(e.latlng, this.getZoom());
      },
    });
    return null;
  };
  const MoveMapPosition = ({ position }) => {
    const map = useMap();
    useEffect(() => {
      if (position) {
        map.flyTo(position, map.getZoom());
      }
    }, [position, map]);
    return null;
  };
  useEffect(() => {
    if (lat && lng) {
      const newPosition = { lat: parseFloat(lat), lng: parseFloat(lng) };
      setPosition(newPosition);
    }
  }, [lat, lng]);

  return (
    <MapContainer
      style={{ width: '100%', height: '325px', borderRadius: '12px' }}
      center={position || { lat: 51.505, lng: -0.09 }}
      zoom={10}
      scrollWheelZoom={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
      />
      <MapClickHandler />
      <MoveMapPosition position={position} />
      {position !== null && (
        <Marker icon={customDivIcon} position={position}>
          <Popup>You are here</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default Map;
