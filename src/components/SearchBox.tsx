'use client';

import { Search, X } from 'lucide-react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBox({
  value,
  onChange,
  placeholder = 'Szukaj latarni...',
}: SearchBoxProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search
          size={16}
          className="text-white/40 group-focus-within:text-amber-400 transition-colors"
          aria-hidden="true"
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 bg-white/5 border border-white/10 rounded-xl
                   text-sm text-white placeholder:text-white/30
                   focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30
                   transition-all"
        aria-label="Wyszukaj latarnię"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white/70 transition-colors"
          aria-label="Wyczyść wyszukiwanie"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
