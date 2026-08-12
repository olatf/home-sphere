'use client';

import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from 'sonner';

type BrandMapProps = {
  lat: number;
  lng: number;
};

export function BrandMap({ lat, lng }: BrandMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!token) {
      toast.error('Missing token');
      return;
    }

    mapboxgl.accessToken = token;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 15,
    });

    new mapboxgl.Marker({ color: '#E63946' })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  const openInMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div className="mt-5">
      <div className="overflow-hidden rounded-xl border border-gray-100">
        <div ref={containerRef} className="h-65 w-full" />
      </div>
      <a
        href={openInMapsUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block font-semibold text-brand-primary text-sm underline underline-offset-4"
      >
        Open exact pin in maps
      </a>
    </div>
  );
}
