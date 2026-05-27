# ⚓ Latarnie Bałtyku — Baltic Lighthouses 3D

Interaktywna wizualizacja latarni morskich Morza Bałtyckiego na obracalnym globie 3D.

## Quick Start

```bash
# 1. Wejdź do katalogu projektu
cd baltic-lighthouses

# 2. Zainstaluj zależności
npm install

# 3. Uruchom dev server
npm run dev

# 4. Otwórz przeglądarkę
# http://localhost:3000
```

## Funkcje (MVP)

- 🌍 Obracalny glob 3D (Globe.gl / Three.js)
- 📍 15 polskich latarni morskich z danymi
- 🖱️ Klik na marker → zoom + panel ze szczegółami
- 📱 Responsywny design (desktop + mobile)
- 🌙 Ciemny motyw z akcentami bursztynowymi

## Stack

- Next.js 14 + TypeScript
- react-globe.gl (Three.js)
- Tailwind CSS
- Framer Motion
- Dane: GeoJSON (OpenStreetMap + ARLHS)

## Struktura

```
src/
├── app/page.tsx           — strona główna
├── components/
│   ├── Globe3D.tsx        — komponent globu 3D
│   └── LighthousePanel.tsx — panel boczny
├── types/lighthouse.ts    — interfejsy TypeScript
public/data/
└── lighthouses.geojson    — dane 15 polskich latarni
```

## Roadmap

- [ ] MVP: 15 polskich latarni ✅ (dane gotowe)
- [ ] v1.0: Cały Bałtyk (~300+ latarni)
- [ ] v2.0: Animowane światła, tryb nocny
- [ ] Deploy na Vercel

## Licencja

Dane: © OpenStreetMap contributors (ODbL)
Tekstury: NASA Blue Marble (Public Domain)
