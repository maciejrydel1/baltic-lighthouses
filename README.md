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

## Funkcje

- 🌍 Obracalny glob 3D (Globe.gl / Three.js)
- 📍 **54 latarnie morskie** z **6 krajów bałtyckich**: Polska, Finlandia, Estonia, Łotwa, Litwa, Rosja
- 🔍 Wyszukiwarka tekstowa (nazwa, opis, kraj)
- 🎛️ Filtry: kraj, status aktywności, typ konstrukcji
- 🧩 Klastrowanie markerów przy oddalaniu globu (supercluster)
- 🖱️ Klik na marker / klaster → animowany zoom + panel ze szczegółami
- 💍 Animowany pierścień zasięgu światła dla wybranej latarni
- 🖼️ Zdjęcia lokalne z fallbackiem na Wikimedia Commons
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
├── app/
│   ├── page.tsx              — strona główna (Server Component)
│   └── LighthousesClient.tsx — klient: stan, glob, filtry, panel
├── components/
│   ├── Globe3D.tsx           — komponent globu 3D z klastrowaniem
│   ├── LighthousePanel.tsx   — panel boczny
│   ├── SearchBox.tsx         — wyszukiwarka
│   └── FilterBar.tsx         — filtry
├── lib/
│   └── filters.ts            — logika filtrowania i wyszukiwania
├── types/lighthouse.ts       — interfejsy TypeScript + helpery
├── test/
│   ├── setup.ts              — konfiguracja testów (mock next/image)
│   └── fixtures.ts           — dane testowe
public/
├── data/lighthouses.geojson  — dane 54 latarni
├── images/lighthouses/*.jpg  — lokalne zdjęcia
└── textures/                 — tekstury globu
```

## Roadmap

- [x] MVP: 15 polskich latarni na globie 3D
- [x] Rozszerzenie bazy do 54 latarni z 6 krajów bałtyckich
- [x] v1.0: Filtry (kraj/status/typ), wyszukiwarka, klastrowanie markerów
- [x] v1.0: Metadane `admiraltyCode` uzupełnione dla 52/54 latarni
- [ ] v1.0: Cały Bałtyk (~300+ latarni)
- [ ] v2.0: Animowane światła, tryb nocny, parser sekwencji świateł
- [ ] Deploy produkcyjny na Vercel

## Testy

```bash
npm run test        # jednorazowe uruchomienie testów
npm run test:watch  # tryb obserwacji
npm run test:coverage # raport pokrycia (wymaga zainstalowanego narzędzia do pokrycia)
```

Stack testowy: Vitest + React Testing Library + jsdom.

## Licencja

Dane: © OpenStreetMap contributors (ODbL)
Tekstury: NASA Blue Marble (Public Domain)
