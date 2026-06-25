'use client';

import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useMemo, useState, forwardRef } from 'react';
import { Lighthouse, LIGHT_COLORS, LighthouseStatus } from '@/types/lighthouse';

// Kolory markerów w zależności od statusu
const STATUS_COLORS: Record<LighthouseStatus, string> = {
  active: '', // użyje koloru światła
  inactive: '#6b7280', // szary
  historical: '#92400e', // bursztynowy przygaszony
};

// Rozmiary markerów
const STATUS_RADIUS: Record<LighthouseStatus, number> = {
  active: 0.07,
  inactive: 0.05,
  historical: 0.05,
};

// Wrapper z forwardRef dla dynamicznego importu
const GlobeWrapper = dynamic(
  () => import('react-globe.gl').then((mod) => {
    const Globe = mod.default;
    // Tworzymy wrapper który przekazuje ref przez callback prop
    const GlobeWithRef = forwardRef((props: any, ref: any) => {
      const { onGlobeRef, ...rest } = props;

      const callbackRef = useCallback((el: any) => {
        if (el && onGlobeRef) {
          onGlobeRef(el);
        }
      }, [onGlobeRef]);

      return <Globe {...rest} ref={callbackRef} />;
    });
    GlobeWithRef.displayName = 'GlobeWithRef';
    return GlobeWithRef;
  }),
  { ssr: false }
);

interface Globe3DProps {
  lighthouses: Lighthouse[];
  selectedId: string | null;
  onSelect: (lighthouse: Lighthouse) => void;
}

type PointData = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  color: string;
  altitude: number;
  radius: number;
  rangeNm: number;
  lightColor: string;
  yearBuilt: number;
  heightM: number;
  status: LighthouseStatus;
};

type RingData = {
  lat: number;
  lng: number;
  maxR: number;
  propagationSpeed: number;
  repeatPeriod: number;
  color: string;
};

export function Globe3D({ lighthouses, selectedId, onSelect }: Globe3DProps) {
  const [globeEl, setGlobeEl] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const updateLayout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
        setIsMobile(
          window.innerWidth < 768 ||
            ('ontouchstart' in window) ||
            navigator.maxTouchPoints > 0
        );
      }, 100);
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => {
      window.removeEventListener('resize', updateLayout);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Callback do otrzymania ref
  const handleGlobeRef = useCallback((el: any) => {
    setGlobeEl(el);
  }, []);

  // Animacja wejściowa do Bałtyku
  useEffect(() => {
    if (!globeEl) return;

    // Ustaw widok z daleka (Afryka)
    globeEl.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 0);
    globeEl.controls().autoRotate = true;
    globeEl.controls().autoRotateSpeed = 0.5;

    // Po chwili animuj do Bałtyku i zatrzymaj
    const timer = setTimeout(() => {
      if (globeEl) {
        globeEl.controls().autoRotate = false;
        globeEl.pointOfView(
          { lat: 59.5, lng: 17, altitude: 1.2 },  // Tallinn na środku
          2500
        );
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [globeEl]);

  const handlePointClick = useCallback(
    (point: PointData) => {
      const lighthouse = lighthouses.find((l) => l.id === point.id);
      if (lighthouse) {
        onSelect(lighthouse);
      }
    },
    [lighthouses, onSelect]
  );

  // Markery - kolor i rozmiar zależą od statusu
  const pointsData = useMemo<PointData[]>(() => {
    return lighthouses.map((l) => {
      const isActive = l.status === 'active';
      const baseColor = isActive
        ? (LIGHT_COLORS[l.lightColor] || LIGHT_COLORS.white)
        : STATUS_COLORS[l.status];
      const baseRadius = STATUS_RADIUS[l.status];

      return {
        id: l.id,
        lat: l.coordinates[1],
        lng: l.coordinates[0],
        name: l.name,
        color: baseColor,
        altitude: isActive ? 0.005 : 0.003, // nieaktywne niżej
        radius: l.id === selectedId ? 0.12 : baseRadius,
        rangeNm: l.rangeNm,
        lightColor: l.lightColor,
        yearBuilt: l.yearBuilt,
        heightM: l.heightM,
        status: l.status,
      };
    });
  }, [lighthouses, selectedId]);

  // Pierścienie zasięgu
  const ringsData = useMemo<RingData[]>(() => {
    if (!selectedId) return [];
    return lighthouses
      .filter((l) => l.id === selectedId)
      .map((l) => ({
        lat: l.coordinates[1],
        lng: l.coordinates[0],
        maxR: l.rangeNm * 0.054,
        propagationSpeed: 2,
        repeatPeriod: 1200,
        color: LIGHT_COLORS[l.lightColor] || LIGHT_COLORS.white,
      }));
  }, [lighthouses, selectedId]);

  const pointLabel = useCallback((d: PointData) => {
    const statusLabel = d.status === 'active' ? '🟢 Aktywna' : d.status === 'inactive' ? '⚫ Nieaktywna' : '🟤 Historyczna';
    return `
      <div style="
        background: rgba(10,10,26,0.92);
        border: 1px solid ${d.color};
        border-radius: 8px;
        padding: 10px 14px;
        font-family: system-ui, -apple-system, sans-serif;
        color: white;
        font-size: 13px;
        line-height: 1.5;
        max-width: 220px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      ">
        <div style="font-weight:700; color: #f59e0b; font-size:14px; margin-bottom:4px;">${d.name}</div>
        <div style="font-size:11px; margin-bottom:4px;">${statusLabel}</div>
        <div>Światło: <span style="color:${d.color}">●</span> ${d.lightColor}</div>
        <div>Zasięg: ${d.rangeNm} Mm (~${Math.round(d.rangeNm * 1.852)} km)</div>
        <div>Wysokość: ${d.heightM} m</div>
        <div>Rok budowy: ${d.yearBuilt}</div>
        <div style="margin-top:6px; font-size:11px; color:rgba(255,255,255,0.5)">Kliknij, aby zobaczyć szczegóły</div>
      </div>
    `;
  }, []);

  const ringColor = useCallback((d: RingData) => [`${d.color}88`, `${d.color}00`], []);

  if (dimensions.width === 0) return null;

  return (
    <GlobeWrapper
      onGlobeRef={handleGlobeRef}
      width={dimensions.width}
      height={dimensions.height}
      // Desktop: 8K WebP (~1,8 MB) zamiast 21K JPG (~21 MB) — dużo mniejszy transfer,
      // przy zachowaniu wysokiej jakości wizualnej bez pikselozji na typowych ekranach.
      // Mobile: pozostaje lekka tekstura 1,4 MB.
      globeImageUrl={isMobile ? "/textures/earth-blue-marble.jpg" : "/textures/earth-8k.webp"}
      bumpImageUrl="/textures/earth-topology.png"
      backgroundImageUrl="/textures/night-sky.png"
      atmosphereColor="#4a90d9"
      atmosphereAltitude={0.15}
      pointsData={pointsData}
      pointLat="lat"
      pointLng="lng"
      pointColor="color"
      pointAltitude="altitude"
      pointRadius="radius"
      pointLabel={pointLabel}
      onPointClick={handlePointClick}
      ringsData={ringsData}
      ringLat="lat"
      ringLng="lng"
      ringMaxRadius="maxR"
      ringPropagationSpeed="propagationSpeed"
      ringRepeatPeriod="repeatPeriod"
      ringColor={ringColor}
      animateIn={false}
    />
  );
}
