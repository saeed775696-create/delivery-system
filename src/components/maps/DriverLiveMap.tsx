"use client";

import "leaflet/dist/leaflet.css";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";

import { useEffect, useState } from "react";

const icon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type DriverLocation = {
  driverId: string;
  lat: number;
  lng: number;
};

export default function DriverLiveMap() {
  const [mounted, setMounted] =
    useState(false);

  const [location, setLocation] =
    useState<DriverLocation | null>(
      null
    );

  useEffect(() => {
    setMounted(true);

    setLocation({
      driverId: "1",
      lat: 15.3694,
      lng: 44.191,
    });
  }, []);

  if (!mounted) return null;

  return (
    <div className="rounded-2xl overflow-hidden">
      <MapContainer
        center={[15.3694, 44.191]}
        zoom={13}
        style={{
          height: "500px",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {location && (
          <Marker
            position={[
              location.lat,
              location.lng,
            ]}
            icon={icon}
          >
            <Popup>
              السائق يتحرك الآن
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}