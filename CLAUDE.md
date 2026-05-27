# Baltic Lighthouses 3D

## Opis projektu
Interaktywna aplikacja webowa prezentująca latarnie morskie Morza Bałtyckiego na obracalnym globie 3D. Użytkownik eksploruje latarnie, klika markery, przegląda szczegóły, filtruje wg kraju/statusu/typu.

## Stack technologiczny
- **Framework:** Next.js 14+ (App Router) + TypeScript
- **3D Globe:** `globe.gl` via `react-globe.gl`
- **Styling:** Tailwind CSS 3+
- **Dane:** statyczny GeoJSON (`/public/data/lighthouses.geojson`)
- **Ikony:** `lucide-react`
- **Animacje:** `framer-motion`
- **State:** React hooks (useState, useEffect, useCallback)

## Struktura projektu
```
baltic-lighthouses/
├── public/
│   ├── data/
│   │   └── lighthouses.geojson      # Dane latarni
│   └── textures/
│       └── earth-blue-marble.jpg     # Tekstura globu (NASA)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Strona główna z globem
│   │   └── globals.css
│   ├── components/
│   │   ├── Globe3D.tsx               # Komponent globu
│   │   ├── LighthousePanel.tsx       # Panel boczny z detalami
│   │   ├── FilterBar.tsx             # Filtry (kraj, status, typ)
│   │   └── SearchBox.tsx             # Wyszukiwarka
│   ├── types/
│   │   └── lighthouse.ts            # TypeScript interfejsy
│   └── utils/
│       └── lightSequenceParser.ts    # Parser sekwencji świateł
├── scripts/
│   └── fetch-osm-data.py            # Skrypt pobierania z OSM
├── CLAUDE.md                         # Ten plik
├── package.json
└── tsconfig.json
```

## Konwencje kodowania
- Komponenty React: functional components z hooks
- Nazewnictwo plików: PascalCase dla komponentów, camelCase dla utils
- Eksporty: named exports (nie default) z wyjątkiem page.tsx
- Komentarze: po polsku lub angielsku, ważne jest żeby były zrozumiałe
- Typy: zawsze TypeScript interfaces, nie `any`

## Kluczowe interfejsy TypeScript

```typescript
interface Lighthouse {
  id: string;
  name: string;
  nameLocal?: string;
  country: string;            // ISO code: PL, SE, DE, DK, FI, EE, LV, LT, RU
  coordinates: [number, number]; // [lng, lat]
  yearBuilt: number;
  heightM: number;
  focalHeightM?: number;
  rangeNm: number;
  lightCharacter?: string;    // np. "Fl W 5s"
  lightColor: string;         // white, red, green
  construction?: string;
  status: 'active' | 'inactive' | 'historical';
  visitable: boolean;
  imageUrl?: string;
  wikipediaUrl?: string;
  description?: string;
}
```

## Globe.gl - ważne uwagi
- `react-globe.gl` wymaga dynamicznego importu z `ssr: false` w Next.js
- Tekstura globu: użyj NASA Blue Marble z `/public/textures/`
- Początkowy widok: wycentrowany na Bałtyku (lat: 58, lng: 18, altitude: 1.5)
- Markery: `pointsData` z `pointLat`, `pointLng`, `pointColor`, `pointAltitude`
- Klik: `onPointClick` → aktualizacja stanu panelu bocznego
- POV animacja: `globeEl.current.pointOfView({ lat, lng, altitude: 0.3 }, 1000)`

## Kolorystyka
- Tło: ciemne (#0a0a1a) — globe najlepiej wygląda na ciemnym tle
- Akcent: złoty/bursztynowy (#f59e0b) — nawiązanie do światła latarni
- Markery aktywne: żółty/biały pulsujący
- Markery nieaktywne: szary przygaszony
- Panel boczny: semi-transparentny ciemny (#1a1a2e/90%)
- Tekst: biały/jasnoszary

## Fazy rozwoju
1. **MVP:** 15 polskich latarni na globie, panel z detalami, auto-rotate
2. **v1.0:** Cały Bałtyk (~300+), filtry, wyszukiwarka
3. **v2.0:** Animowane światła, tryb nocny, galeria zdjęć

## Obecna faza: MVP
Skup się na:
- Wyświetleniu globu z 15 polskimi latarniami
- Klikalnych markerach z animacją zoom
- Panelu bocznym z podstawowymi informacjami
- Responsywnym layoutcie
- Deploy na Vercel

## Komendy
```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Linting
```
