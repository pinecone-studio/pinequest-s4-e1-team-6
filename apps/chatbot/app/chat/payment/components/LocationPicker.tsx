"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPos?: [number, number];
}

function MapController({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  const isInitialRender = useRef(true);
  const map = useMap();

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      map.flyTo([lat, lng], map.getZoom(), {
        animate: true,
        duration: 1,
      });
      onChange(lat, lng);
    },
  });

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
    }
  }, []);

  return null;
}

function LocateMeButton({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  const handleLocate = () => {
    if (!("geolocation" in navigator)) {
      alert("Төхөөрөмж location support хийхгүй байна.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        map.flyTo([latitude, longitude], 16, {
          animate: true,
          duration: 1.5,
        });

        onChange(latitude, longitude);
      },
      () => {
        alert(
          "Байршил авах боломжгүй байна. Browser дээрээ location permission зөвшөөрнө үү.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return (
    <button
      type="button"
      onClick={handleLocate}
      className="absolute bottom-16 right-4 z-[1000] bg-white p-3 rounded-full shadow-xl hover:bg-slate-50 active:scale-90 transition-all border border-slate-200"
      title="My Location"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ef4444"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
      </svg>
    </button>
  );
}

export default function LocationPicker({
  onLocationSelect,
  initialPos,
}: LocationPickerProps) {
  const defaultPos: [number, number] = initialPos || [47.9188, 106.9176];

  return (
    <div className="relative w-full h-[300px] rounded-xl overflow-hidden border-2 border-slate-200 shadow-lg">
      <MapContainer
        center={defaultPos}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <MapController onChange={onLocationSelect} />
        <LocateMeButton onChange={onLocationSelect} />
      </MapContainer>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[100%] z-[1000] pointer-events-none">
        <div className="relative flex flex-col items-center">
          <div className="w-9 h-9 bg-red-600 rounded-full border-[3px] border-white shadow-2xl flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div className="w-[3px] h-5 bg-red-600 shadow-lg"></div>
          <div className="w-3 h-1.5 bg-black/30 rounded-[100%] blur-[2px] mt-[-2px]"></div>
        </div>
      </div>
    </div>
  );
}
