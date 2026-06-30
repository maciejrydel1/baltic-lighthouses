'use client';

import { useCallback, useMemo, useState } from 'react';
import { Globe3D } from '@/components/Globe3D';
import { LighthousePanel } from '@/components/LighthousePanel';
import { SearchBox } from '@/components/SearchBox';
import { FilterBar } from '@/components/FilterBar';
import {
  applyFiltersAndSearch,
  DEFAULT_FILTERS,
  LighthouseFilters,
} from '@/lib/filters';
import { Lighthouse } from '@/types/lighthouse';

interface LighthousesClientProps {
  lighthouses: Lighthouse[];
}

export function LighthousesClient({ lighthouses }: LighthousesClientProps) {
  const [selected, setSelected] = useState<Lighthouse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<LighthouseFilters>(DEFAULT_FILTERS);

  const filteredLighthouses = useMemo(
    () => applyFiltersAndSearch(lighthouses, filters, searchQuery),
    [lighthouses, filters, searchQuery]
  );

  // Jeśli wybrana latarnia znika z wyników, zamykamy panel.
  const selectedInResults = useMemo(
    () => !!selected && filteredLighthouses.some((l) => l.id === selected.id),
    [selected, filteredLighthouses]
  );

  const handleSelect = useCallback((lighthouse: Lighthouse) => {
    setSelected(lighthouse);
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
  }, []);

  const activeCount = useMemo(
    () => lighthouses.filter((l) => l.status === 'active').length,
    [lighthouses]
  );

  const filteredActiveCount = useMemo(
    () => filteredLighthouses.filter((l) => l.status === 'active').length,
    [filteredLighthouses]
  );

  const countryList = useMemo(() => {
    const codes = Array.from(new Set(lighthouses.map((l) => l.country))).sort();
    return codes.join(' · ');
  }, [lighthouses]);

  const availableCountries = useMemo(
    () => Array.from(new Set(lighthouses.map((l) => l.country))).sort(),
    [lighthouses]
  );

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a0a1a]">
      {/* Glob 3D */}
      <Globe3D
        lighthouses={filteredLighthouses}
        selectedId={selectedInResults ? selected?.id || null : null}
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

      {/* Wyszukiwarka i filtry */}
      <div className="absolute top-6 right-6 z-40 w-72 max-w-[calc(100vw-3rem)] space-y-3">
        <SearchBox value={searchQuery} onChange={setSearchQuery} />
        <FilterBar
          filters={filters}
          availableCountries={availableCountries}
          resultCount={filteredLighthouses.length}
          totalCount={lighthouses.length}
          onChange={setFilters}
        />
      </div>

      {/* Statystyki (lewy dolny róg) */}
      <div className="absolute bottom-6 left-6 z-30 pointer-events-none">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/30">
          <span>
            🟢 {filteredActiveCount}/{activeCount} aktywnych
          </span>
          {countryList && <span>{countryList}</span>}
          <span>Kliknij latarnię, aby zobaczyć szczegóły</span>
        </div>
      </div>

      {/* Panel boczny */}
      <LighthousePanel
        lighthouse={selectedInResults ? selected : null}
        onClose={handleClose}
      />
    </main>
  );
}
