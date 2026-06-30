'use client';

import { Filter, RotateCcw } from 'lucide-react';
import {
  LighthouseFilters,
  hasActiveFilters,
  toggleFilterValue,
} from '@/lib/filters';
import {
  LighthouseStatus,
  ConstructionCategory,
  COUNTRY_NAMES,
  CONSTRUCTION_CATEGORIES,
  STATUS_NAMES,
} from '@/types/lighthouse';

interface FilterBarProps {
  filters: LighthouseFilters;
  availableCountries: string[];
  resultCount?: number;
  totalCount?: number;
  onChange: (filters: LighthouseFilters) => void;
}

export function FilterBar({
  filters,
  availableCountries,
  resultCount,
  totalCount,
  onChange,
}: FilterBarProps) {
  const active = hasActiveFilters(filters);

  const handleCountryToggle = (country: string) => {
    onChange({
      ...filters,
      countries: toggleFilterValue(filters.countries, country),
    });
  };

  const handleStatusToggle = (status: LighthouseStatus) => {
    onChange({
      ...filters,
      statuses: toggleFilterValue(filters.statuses, status),
    });
  };

  const handleConstructionToggle = (category: ConstructionCategory) => {
    onChange({
      ...filters,
      constructionCategories: toggleFilterValue(
        filters.constructionCategories,
        category
      ),
    });
  };

  const handleClear = () => {
    onChange({
      countries: [],
      statuses: [],
      constructionCategories: [],
    });
  };

  return (
    <div
      className="bg-[#0f0f23]/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl"
      aria-label="Filtry latarni"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-amber-400">
          <Filter size={16} aria-hidden="true" />
          <span className="text-sm font-semibold">Filtry</span>
        </div>
        {active && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-white/50 hover:text-white/90 transition-colors"
            aria-label="Wyczyść filtry"
          >
            <RotateCcw size={12} aria-hidden="true" />
            Wyczyść
          </button>
        )}
      </div>

      {/* Kraj */}
      <FilterSection title="Kraj">
        <div className="flex flex-wrap gap-2">
          {availableCountries.map((code) => (
            <FilterChip
              key={code}
              label={COUNTRY_NAMES[code] || code}
              active={filters.countries.includes(code)}
              onClick={() => handleCountryToggle(code)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Status */}
      <FilterSection title="Status">
        <div className="flex flex-wrap gap-2">
          {(['active', 'inactive', 'historical'] as LighthouseStatus[]).map(
            (status) => (
              <FilterChip
                key={status}
                label={STATUS_NAMES[status]}
                active={filters.statuses.includes(status)}
                onClick={() => handleStatusToggle(status)}
              />
            )
          )}
        </div>
      </FilterSection>

      {/* Konstrukcja */}
      <FilterSection title="Typ konstrukcji">
        <div className="flex flex-wrap gap-2">
          {CONSTRUCTION_CATEGORIES.map(({ category, name }) => (
            <FilterChip
              key={category}
              label={name}
              active={filters.constructionCategories.includes(category)}
              onClick={() => handleConstructionToggle(category)}
            />
          ))}
          <FilterChip
            label="Inna"
            active={filters.constructionCategories.includes('other')}
            onClick={() => handleConstructionToggle('other')}
          />
        </div>
      </FilterSection>

      {typeof resultCount === 'number' && typeof totalCount === 'number' && (
        <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/40">
          Wyniki:{' '}
          <span className="text-amber-400 font-medium">{resultCount}</span> /{' '}
          {totalCount}
        </div>
      )}
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <h3 className="text-[10px] uppercase tracking-wider text-white/30 mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border
        ${
          active
            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/90'
        }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
