'use client';

import { useState } from 'react';
import { Lighthouse, COUNTRY_NAMES } from '@/types/lighthouse';
import { X, MapPin, Calendar, Ruler, Sun, Eye, ExternalLink, Navigation, ImageOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LighthousePanelProps {
  lighthouse: Lighthouse | null;
  onClose: () => void;
}

export function LighthousePanel({ lighthouse, onClose }: LighthousePanelProps) {
  return (
    <AnimatePresence>
      {lighthouse && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-full sm:w-96 z-50
                     bg-[#0f0f23]/95 backdrop-blur-xl border-l border-amber-500/20
                     overflow-y-auto"
        >
          {/* Header z przyciskiem zamknij */}
          <div className="sticky top-0 bg-[#0f0f23]/90 backdrop-blur-sm p-4 flex justify-between items-start border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-amber-400">{lighthouse.name}</h2>
              {lighthouse.nameLocal && (
                <p className="text-sm text-white/50 mt-0.5">{lighthouse.nameLocal}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                  {COUNTRY_NAMES[lighthouse.country] || lighthouse.country}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    lighthouse.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : lighthouse.status === 'inactive'
                        ? 'bg-gray-500/20 text-gray-400'
                        : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {lighthouse.status === 'active'
                    ? 'Aktywna'
                    : lighthouse.status === 'inactive'
                      ? 'Nieaktywna'
                      : 'Historyczna'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition text-white/50 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Zdjęcie */}
          <LighthouseImage id={lighthouse.id} name={lighthouse.name} imageUrl={lighthouse.imageUrl} />

          {/* Opis */}
          {lighthouse.description && (
            <div className="px-4 pt-4">
              <p className="text-sm text-white/70 leading-relaxed">{lighthouse.description}</p>
            </div>
          )}

          {/* Parametry techniczne */}
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">
              Parametry
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <InfoCard
                icon={<Calendar size={16} />}
                label="Rok budowy"
                value={lighthouse.yearBuilt.toString()}
              />
              <InfoCard
                icon={<Ruler size={16} />}
                label="Wysokość"
                value={`${lighthouse.heightM} m`}
              />
              <InfoCard
                icon={<Navigation size={16} />}
                label="Zasięg"
                value={`${lighthouse.rangeNm} Mm`}
              />
              <InfoCard
                icon={<Sun size={16} />}
                label="Światło"
                value={lighthouse.lightCharacter || '—'}
              />
              {lighthouse.focalHeightM && (
                <InfoCard
                  icon={<Eye size={16} />}
                  label="Wys. ogniska"
                  value={`${lighthouse.focalHeightM} m n.p.m.`}
                />
              )}
              <InfoCard
                icon={<MapPin size={16} />}
                label="Współrzędne"
                value={`${lighthouse.coordinates[1].toFixed(3)}°N ${lighthouse.coordinates[0].toFixed(3)}°E`}
              />
            </div>
          </div>

          {/* Dodatkowe info */}
          {(lighthouse.construction || lighthouse.arlhsCode) && (
            <div className="px-4 pb-4 space-y-2">
              <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">
                Detale
              </h3>
              {lighthouse.construction && (
                <DetailRow label="Konstrukcja" value={lighthouse.construction} />
              )}
              {lighthouse.arlhsCode && (
                <DetailRow label="Kod ARLHS" value={lighthouse.arlhsCode} />
              )}
              {lighthouse.admiraltyCode && (
                <DetailRow label="Kod Admiralicji" value={lighthouse.admiraltyCode} />
              )}
              {lighthouse.visitorsPerYear && (
                <DetailRow
                  label="Odwiedzający/rok"
                  value={lighthouse.visitorsPerYear.toLocaleString('pl-PL')}
                />
              )}
              <DetailRow
                label="Dostępna"
                value={lighthouse.visitable ? 'Tak — otwarta dla turystów' : 'Nie'}
              />
            </div>
          )}

          {/* Linki */}
          <div className="p-4 border-t border-white/10 space-y-2">
            {lighthouse.wikipediaUrl && (
              <a
                href={lighthouse.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition"
              >
                <ExternalLink size={14} />
                Wikipedia
              </a>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Karta z pojedynczym parametrem
function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
      <div className="flex items-center gap-1.5 text-amber-400/60 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}

// Wiersz szczegółów
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/40">{label}</span>
      <span className="text-white/80">{value}</span>
    </div>
  );
}

// Komponent zdjęcia z obsługą lokalnych plików i fallback na Wikimedia
function LighthouseImage({ id, name, imageUrl }: { id: string; name: string; imageUrl?: string | null }) {
  const [localError, setLocalError] = useState(false);
  const [remoteError, setRemoteError] = useState(false);

  // Ścieżka do lokalnego zdjęcia (obsługuje .jpg, .jpeg, .png, .webp)
  const localImageUrl = `/images/lighthouses/${id}.jpg`;

  // Jeśli oba źródła zawiodły - placeholder
  if (localError && (remoteError || !imageUrl)) {
    return (
      <div className="relative h-52 bg-gradient-to-br from-amber-900/20 to-slate-900/40 flex items-center justify-center">
        <div className="text-center">
          <ImageOff className="w-12 h-12 text-white/20 mx-auto mb-2" />
          <p className="text-xs text-white/30">Brak zdjęcia</p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f23] via-transparent to-transparent" />
      </div>
    );
  }

  // Próbuj najpierw lokalne zdjęcie, potem Wikimedia
  const currentSrc = !localError ? localImageUrl : imageUrl;

  return (
    <div className="relative h-52 overflow-hidden">
      <img
        src={currentSrc || ''}
        alt={name}
        className="w-full h-full object-contain bg-black/50"
        loading="lazy"
        onError={() => {
          if (!localError) {
            setLocalError(true);
          } else {
            setRemoteError(true);
          }
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f23] via-transparent to-transparent" />
    </div>
  );
}
