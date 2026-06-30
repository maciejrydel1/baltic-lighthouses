'use client';

import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GlobeMethods, GlobeProps } from 'react-globe.gl';
import Supercluster from 'supercluster';
import {
  Lighthouse,
  LIGHT_COLORS,
  LighthouseStatus,
} from '@/types/lighthouse';

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

const CLUSTER_COLOR = '#f59e0b';
const CLUSTER_RADIUS_BASE = 0.1;

interface GlobeWrapperProps extends GlobeProps {
  onGlobeRef?: (el: GlobeMethods | null) => void;
}

// Wrapper z dynamicznym importu react-globe.gl (tylko po stronie klienta)
const GlobeWrapper = dynamic(
  () =>
    import('react-globe.gl').then((mod) => {
      const Globe = mod.default;

      function GlobeWithRef({ onGlobeRef, ...rest }: GlobeWrapperProps) {
        const globeRef = useRef<GlobeMethods | undefined>(undefined);

        useEffect(() => {
          if (globeRef.current && onGlobeRef) {
            onGlobeRef(globeRef.current);
          }
        }, [onGlobeRef]);

        return <Globe {...rest} ref={globeRef} />;
      }

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
  rangeNm?: number;
  lightColor?: string;
  yearBuilt?: number;
  heightM?: number;
  status?: LighthouseStatus;
  cluster?: boolean;
  pointCount?: number;
  clusterId?: number;
};

type RingData = {
  lat: number;
  lng: number;
  maxR: number;
  propagationSpeed: number;
  repeatPeriod: number;
  color: string;
};

function assertPointData(d: object): PointData {
  if (!('id' in d)) {
    throw new Error('Invalid point data: missing id');
  }
  return d as PointData;
}

function assertRingData(d: object): RingData {
  if (!('color' in d)) {
    throw new Error('Invalid ring data: missing color');
  }
  return d as RingData;
}

// Przybliżone mapowanie altitude globu na poziom zoomu supercluster.
function altitudeToZoom(altitude: number): number {
  const safeAltitude = Math.max(0.05, altitude);
  const zoom = Math.round(24 - safeAltitude * 8);
  return Math.max(1, Math.min(24, zoom));
}

export function Globe3D({ lighthouses, selectedId, onSelect }: Globe3DProps) {
  const [globeEl, setGlobeEl] = useState<GlobeMethods | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const introStartedRef = useRef(false);

  const superclusterRef = useRef<Supercluster | null>(null);
  const [clusters, setClusters] = useState<
    ReturnType<Supercluster['getClusters']>
  >([]);

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
            'ontouchstart' in window ||
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

  // Callback do otrzymania instancji globu
  const handleGlobeRef = useCallback((el: GlobeMethods | null) => {
    setGlobeEl(el);
  }, []);

  // Animacja wejściowa do Bałtyku
  useEffect(() => {
    if (!globeEl || introStartedRef.current) return;

    // Zabezpieczenie przed podwójnym uruchomieniem w React Strict Mode
    introStartedRef.current = true;
    let isMounted = true;

    // Ustaw widok z daleka (Afryka)
    globeEl.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 0);
    globeEl.controls().autoRotate = true;
    globeEl.controls().autoRotateSpeed = 0.5;

    // Po chwili animuj do Bałtyku i zatrzymaj
    const timer = setTimeout(() => {
      if (isMounted && globeEl) {
        globeEl.controls().autoRotate = false;
        // Uwaga: altitude 0.35 jest poniżej powierzchni Ziemi, ale Globe.gl
        // mapuje je na odpowiednie przybliżenie, w którym Bałtyk wypełnia kadr.
        // Wyższe wartości (1.x) pozostawiają glob zbyt oddalony.
        globeEl.pointOfView({ lat: 59.5, lng: 17, altitude: 0.35 }, 2500);
      }
    }, 1200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [globeEl]);

  // Budowa indeksu supercluster po każdej zmianie zestawu latarni.
  useEffect(() => {
    if (lighthouses.length === 0) {
      superclusterRef.current = null;
      setClusters([]);
      return;
    }

    const sc = new Supercluster({
      radius: 60,
      maxZoom: 16,
      minPoints: 2,
    });

    const features: Supercluster.PointFeature<{ id: string }>[] =
      lighthouses.map((l) => ({
        type: 'Feature',
        properties: { id: l.id },
        geometry: {
          type: 'Point',
          coordinates: l.coordinates,
        },
      })) as Supercluster.PointFeature<{ id: string }>[];

    sc.load(features);
    superclusterRef.current = sc;

    // Początkowe klastry przy widoku z daleka.
    const initialClusters = sc.getClusters([-180, -85, 180, 85], 1);
    setClusters(initialClusters);
  }, [lighthouses]);

  // Aktualizacja klastrów przy zmianie POV globu.
  useEffect(() => {
    if (!globeEl || !superclusterRef.current) return;

    let frameId: number;
    let isMounted = true;

    const updateClusters = () => {
      if (!isMounted || !globeEl || !superclusterRef.current) return;

      const pov = globeEl.pointOfView();
      const altitude = typeof pov.altitude === 'number' ? pov.altitude : 2.5;
      const zoom = altitudeToZoom(altitude);
      const nextClusters = superclusterRef.current.getClusters(
        [-180, -85, 180, 85],
        zoom
      );
      setClusters(nextClusters);
      frameId = requestAnimationFrame(updateClusters);
    };

    frameId = requestAnimationFrame(updateClusters);

    return () => {
      isMounted = false;
      cancelAnimationFrame(frameId);
    };
  }, [globeEl]);

  const handlePointClick = useCallback(
    (point: object) => {
      const data = assertPointData(point);

      // Kliknięcie w klaster → przybliżenie do poziomu rozwinięcia.
      if (data.cluster && data.clusterId !== undefined && globeEl && superclusterRef.current) {
        try {
          const expansionZoom = superclusterRef.current.getClusterExpansionZoom(
            data.clusterId
          );
          const targetAltitude = Math.max(0.15, 24 / (expansionZoom * 3));
          globeEl.pointOfView(
            { lat: data.lat, lng: data.lng, altitude: targetAltitude },
            800
          );
        } catch {
          // Fallback: zwykłe przybliżenie.
          globeEl?.pointOfView(
            { lat: data.lat, lng: data.lng, altitude: 0.35 },
            800
          );
        }
        return;
      }

      const lighthouse = lighthouses.find((l) => l.id === data.id);
      if (lighthouse) {
        onSelect(lighthouse);
      }
    },
    [lighthouses, onSelect, globeEl]
  );

  // Markery - kolor i rozmiar zależą od statusu lub czy to klaster
  const pointsData = useMemo<PointData[]>(() => {
    const lighthouseById = new Map(lighthouses.map((l) => [l.id, l]));

    return clusters.map((cluster) => {
      const [lng, lat] = cluster.geometry.coordinates;
      const props = cluster.properties as
        | Supercluster.ClusterProperties
        | { id: string };

      if ('cluster' in props && props.cluster) {
        const count = props.point_count || 0;
        return {
          id: `cluster-${props.cluster_id}`,
          lat,
          lng,
          name: `${count} latarni`,
          color: CLUSTER_COLOR,
          altitude: 0.008,
          radius: CLUSTER_RADIUS_BASE + Math.min(0.08, count * 0.004),
          cluster: true,
          pointCount: count,
          clusterId: props.cluster_id,
        };
      }

      const id = (props as { id: string }).id;
      const l = lighthouseById.get(id);
      if (!l) {
        return {
          id,
          lat,
          lng,
          name: '',
          color: '#ffffff',
          altitude: 0.005,
          radius: 0.05,
        };
      }

      const isActive = l.status === 'active';
      const baseColor = isActive
        ? LIGHT_COLORS[l.lightColor] || LIGHT_COLORS.white
        : STATUS_COLORS[l.status];
      const baseRadius = STATUS_RADIUS[l.status];

      return {
        id: l.id,
        lat,
        lng,
        name: l.name,
        color: baseColor,
        altitude: isActive ? 0.005 : 0.003,
        radius: l.id === selectedId ? 0.12 : baseRadius,
        rangeNm: l.rangeNm,
        lightColor: l.lightColor,
        yearBuilt: l.yearBuilt,
        heightM: l.heightM,
        status: l.status,
      };
    });
  }, [clusters, lighthouses, selectedId]);

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

  const pointLabel = useCallback((d: object) => {
    const point = assertPointData(d);

    if (point.cluster && point.pointCount) {
      return `
        <div style="
          background: rgba(245, 158, 11, 0.92);
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          font-weight: 700;
          font-size: 13px;
          font-family: system-ui, -apple-system, sans-serif;
          box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);
        ">${point.pointCount}</div>
      `;
    }

    const statusLabel =
      point.status === 'active'
        ? '🟢 Aktywna'
        : point.status === 'inactive'
        ? '⚫ Nieaktywna'
        : point.status === 'historical'
        ? '🟤 Historyczna'
        : '';

    return `
      <div style="
        background: rgba(10,10,26,0.92);
        border: 1px solid ${point.color};
        border-radius: 8px;
        padding: 10px 14px;
        font-family: system-ui, -apple-system, sans-serif;
        color: white;
        font-size: 13px;
        line-height: 1.5;
        max-width: 220px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      ">
        <div style="font-weight:700; color: #f59e0b; font-size:14px; margin-bottom:4px;">${point.name}</div>
        ${statusLabel ? `<div style="font-size:11px; margin-bottom:4px;">${statusLabel}</div>` : ''}
        ${point.lightColor ? `<div>Światło: <span style="color:${point.color}">●</span> ${point.lightColor}</div>` : ''}
        ${point.rangeNm ? `<div>Zasięg: ${point.rangeNm} Mm (~${Math.round(point.rangeNm * 1.852)} km)</div>` : ''}
        ${point.heightM ? `<div>Wysokość: ${point.heightM} m</div>` : ''}
        ${point.yearBuilt ? `<div>Rok budowy: ${point.yearBuilt}</div>` : ''}
        <div style="margin-top:6px; font-size:11px; color:rgba(255,255,255,0.5)">Kliknij, aby zobaczyć szczegóły</div>
      </div>
    `;
  }, []);

  const ringColor = useCallback((d: object) => {
    const ring = assertRingData(d);
    return [`${ring.color}88`, `${ring.color}00`];
  }, []);

  if (dimensions.width === 0) return null;

  return (
    <GlobeWrapper
      onGlobeRef={handleGlobeRef}
      width={dimensions.width}
      height={dimensions.height}
      // Desktop: 8K WebP (~1,8 MB) zamiast 21K JPG (~21 MB) — dużo mniejszy transfer,
      // przy zachowaniu wysokiej jakości wizualnej bez pikselozji na typowych ekranach.
      // Mobile: pozostaje lekka tekstura 1,4 MB.
      globeImageUrl={
        isMobile
          ? '/textures/earth-blue-marble.jpg'
          : '/textures/earth-8k.webp'
      }
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
