"use client";
import L from "leaflet";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

// Dummy data for buildings
const dummyData = {
  buildings: [
    {
      _id: "1",
      buildingname: "Building One",
      buildingLocation: "123 Main St",
      latitude: 40.7128,
      longitude: -74.006,
      totalFloors: 10,
      totalRestrooms: 5,
      buildingType: "Commercial",
      contactNumber: "123-456-7890",
    },
    {
      _id: "2",
      buildingname: "Building Two",
      buildingLocation: "456 Broadway",
      latitude: 40.7138,
      longitude: -74.007,
      totalFloors: 15,
      totalRestrooms: 7,
      buildingType: "Residential",
      contactNumber: "098-765-4321",
    },
  ],
};

// Memoized custom icon to avoid re-creating on each render
const customIcon = new L.Icon({
  iconUrl: "/images/dashboard/building-icon.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// A component to adjust the map bounds based on markers' positions
const SetMapBounds = ({ buildings }) => {
  const map = useMap();
  if (buildings.length > 0) {
    const bounds = L.latLngBounds(
      buildings.map((b) => [b.latitude, b.longitude])
    );
    map.fitBounds(bounds);
  }
  return null;
};

const Map = () => {
  const { buildings } = dummyData;

  return (
    <MapContainer
      center={[3, 15]}
      zoom={9}
      style={{ height: "430px", width: "100%", borderRadius: "15px" }}
      attributionControl={false}
      className="grayscale-map"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {buildings.length > 0 && <SetMapBounds buildings={buildings} />}

      {buildings.map((building) => (
        <Marker
          key={building._id}
          position={[
            building.latitude || 34.345234,
            building.longitude || 24.453456,
          ]}
          icon={customIcon}
        >
          <Popup>
            <div className="min-w-[280px]">
              <h2 className="text-lg font-semibold !text-primary dark:text-white mb-4">
                Building Info
              </h2>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm font-medium !text-black dark:text-gray-300">
                  <span className="font-bold">Name:</span>
                  <span className="text-primary font-semibold">
                    {building.buildingname}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium !text-black dark:text-gray-300">
                  <span className="font-bold">Address:</span>
                  <span className="text-primary font-semibold">
                    {building.buildingLocation}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium !text-black dark:text-gray-300">
                  <span className="font-bold">Floors:</span>
                  <span className="text-primary font-semibold">
                    {building.totalFloors}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium !text-black dark:text-gray-300">
                  <span className="font-bold">Restrooms:</span>
                  <span className="text-primary font-semibold">
                    {building.totalRestrooms}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium !text-black dark:text-gray-300">
                  <span className="font-bold">Type:</span>
                  <span className="text-primary font-semibold">
                    {building.buildingType}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium !text-black dark:text-gray-300">
                  <span className="font-bold">Contact Info:</span>
                  <span className="text-primary font-semibold">
                    {building.contactNumber}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <Link
                  href={`/buildings/${building._id}`}
                  className="bg-primary !text-white rounded-md px-6 py-2 w-full text-center"
                >
                  See Full Details
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
