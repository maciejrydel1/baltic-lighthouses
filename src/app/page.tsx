'use client';

import { useCallback, useEffect, useState } from 'react';
import { Globe3D } from '@/components/Globe3D';
import { LighthousePanel } from '@/components/LighthousePanel';
import { Lighthouse, LighthouseCollection, featureToLighthouse } from '@/types/lighthouse';
import { Compass } from 'lucide-react';

export default function Home() {
  const [lighthouses, setLighthouses] = useState<Lighthouse[]>([]);
  const [selected, setSelected] = useState<Lighthouse | null>(null);
  const [loading, setLoading] = useState(true);

  // Załaduj dane GeoJSON
  useEffect(() => {
    fetch('/data/lighthouses.geojson')
      .then((res) => res.json())
      .then((data: LighthouseCollection) => {
        const parsed = data.features.map(featureToLighthouse);
        setLighthouses(parsed);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Błąd ładowania danych:', err);
        setLoading(false);
      });
  }, []);

  const handleSelect = useCallback((lighthouse: Lighthouse) => {
    setSelected(lighthouse);
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a0a1a]">
      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0a1a]">
          <div className="text-center">
            <Compass className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
            <p className="text-white/60 text-sm">Ładowanie latarni morskich...</p>
          </div>
        </div>
      )}

      {/* Glob 3D */}
      <Globe3D
        lighthouses={lighthouses}
        selectedId={selected?.id || null}
        onSelect={handleSelect}
      />

      {/* Tytuł i logo */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <h1 className="text-2xl font-bold text-white/90 tracking-tight">
          <span className="text-amber-400">⚓</span> Latarnie Bałtyku
        </h1>
        <p className="text-sm text-white/40 mt-1">
          {lighthouses.length} latarni morskich na Morzu Bałtyckim
        </p>
      </div>

      {/* Statystyki (lewy dolny róg) */}
      <div className="absolute bottom-6 left-6 z-30 pointer-events-none">
        <div className="flex gap-4 text-xs text-white/30">
          <span>
            🟢 {lighthouses.filter((l) => l.status === 'active').length} aktywnych
          </span>
          <span>Polska 🇵🇱</span>
          <span>Kliknij latarnię, aby zobaczyć szczegóły</span>
        </div>
      </div>

      {/* Panel boczny */}
      <LighthousePanel lighthouse={selected} onClose={handleClose} />
    </main>
  );
}
