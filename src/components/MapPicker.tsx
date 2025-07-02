"use client"; // 👈 ต้องมี

import { useEffect, useRef, useState } from "react";

type Props = {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  value?: string;
};

export default function MapPicker({ onLocationSelect, value }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapLoaded] = useState(false);

  useEffect(() => {
  let mapInstance: google.maps.Map;
  let markerInstance: google.maps.Marker;

  const fallbackLocation = { lat: 13.7563, lng: 100.5018 };

  const createMap = (position: { lat: number; lng: number }) => {
    if (!mapRef.current) return;

    mapInstance = new window.google.maps.Map(mapRef.current, {
      center: position,
      zoom: 15,
    });

    markerInstance = new window.google.maps.Marker({
      position,
      map: mapInstance,
      draggable: true,
    });

    const updateLocation = (lat: number, lng: number) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          onLocationSelect(lat, lng, results[0].formatted_address);
        } else {
          onLocationSelect(lat, lng);
        }
      });
    };

    google.maps.event.addListener(markerInstance, "dragend", (event: google.maps.MapMouseEvent) => {
      const lat = event.latLng?.lat();
      const lng = event.latLng?.lng();
      if (lat !== undefined && lng !== undefined) {
        updateLocation(lat, lng);
      }
    });

    updateLocation(position.lat, position.lng);
  };

  const initMap = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => createMap({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => createMap(fallbackLocation)
      );
    } else {
      createMap(fallbackLocation);
    }
  };

  if (typeof window !== "undefined") {
    if (!window.google || !window.google.maps) {
      const existingScript = document.querySelector("script[src*='maps.googleapis.com']");
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCbReiCh9HSm5Yo5Tq4M40OnIIbFnqjwI8&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener("load", initMap);
      }
    } else {
      initMap();
    }
  }

  // Optional: cleanup map when unmount
  return () => {
    if (markerInstance) {
      markerInstance.setMap(null);
    }
  };
  }, []); 


  return (
    <div>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "300px", border: "1px solid #ccc", borderRadius: "8px" }}
      />
      {value && (
        <div style={{ marginTop: "8px", fontSize: "0.9rem", color: "#333" }}>
          📍 <strong>ตำแหน่ง:</strong> {value}
        </div>
      )}
    </div>
  );
}
