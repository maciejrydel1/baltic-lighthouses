'use client';

import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useState, forwardRef } from 'react';
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

export function Globe3D({ lighthouses, selectedId, onSelect }: Globe3DProps) {
  const [globeEl, setGlobeEl] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Callback do otrzymania ref
  const handleGlobeRef = useCallback((el: any) => {
    console.log('Globe ref received:', el);
    setGlobeEl(el);
  }, []);

  // Animacja wejściowa do Bałtyku
  useEffect(() => {
    if (!globeEl) return;

    console.log('Starting intro animation...');

    // Ustaw widok z daleka (Afryka)
    globeEl.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 0);
    globeEl.controls().autoRotate = true;
    globeEl.controls().autoRotateSpeed = 0.5;

    // Po chwili animuj do Bałtyku i zatrzymaj
    const timer = setTimeout(() => {
      if (globeEl) {
        globeEl.controls().autoRotate = false;
        globeEl.pointOfView(
          { lat: 59.5, lng: 17, altitude: 0.35 },  // Tallinn na środku
          2500
        );
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [globeEl]);

  // Zoom po wybraniu latarni
  useEffect(() => {
    if (selectedId && globeEl) {
      const lighthouse = lighthouses.find((l) => l.id === selectedId);
      if (lighthouse) {
        globeEl.controls().autoRotate = false;
        globeEl.pointOfView(
          {
            lat: lighthouse.coordinates[1],
            lng: lighthouse.coordinates[0],
            altitude: 0.4,
          },
          1500
        );
      }
    }
  }, [selectedId, lighthouses, globeEl]);

  const handlePointClick = useCallback(
    (point: any) => {
      const lighthouse = lighthouses.find((l) => l.id === point.id);
      if (lighthouse) {
        onSelect(lighthouse);
      }
    },
    [lighthouses, onSelect]
  );

  // Kliknięcie na glob (poza markerem) - nic nie robimy
  // Użytkownik może ręcznie obracać globem przez przeciąganie
  const handleGlobeClick = useCallback(() => {
    // Celowo puste - glob nie obraca się automatycznie
  }, []);

  // Markery - kolor i rozmiar zależą od statusu
  const pointsData = lighthouses.map((l) => {
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

  // Pierścienie zasięgu
  const ringsData = selectedId
    ? lighthouses
        .filter((l) => l.id === selectedId)
        .map((l) => ({
          lat: l.coordinates[1],
          lng: l.coordinates[0],
          maxR: l.rangeNm * 0.054,
          propagationSpeed: 2,
          repeatPeriod: 1200,
          color: LIGHT_COLORS[l.lightColor] || LIGHT_COLORS.white,
        }))
    : [];

  if (dimensions.width === 0) return null;

  return (
    <GlobeWrapper
      onGlobeRef={handleGlobeRef}
      width={dimensions.width}
      height={dimensions.height}
      globeImageUrl="/textures/earth-blue-marble.jpg"
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
      pointLabel={(d: any) => {
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
      }}
      onPointClick={handlePointClick}
      ringsData={ringsData}
      ringLat="lat"
      ringLng="lng"
      ringMaxRadius="maxR"
      ringPropagationSpeed="propagationSpeed"
      ringRepeatPeriod="repeatPeriod"
      ringColor={(d: any) => [`${d.color}88`, `${d.color}00`]}
      onGlobeClick={handleGlobeClick}
      animateIn={false}
    />
  );
}
