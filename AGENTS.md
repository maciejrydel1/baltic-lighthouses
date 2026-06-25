# AGENTS.md — Baltic Lighthouses 3D

Ten plik zawiera informacje potrzebne AI coding agentom do pracy nad projektem **Latarnie Bałtyku / Baltic Lighthouses 3D**. Czytelnik nie zna projektu — traktuj ten dokument jako kompletne wprowadzenie.

---

## 1. Project overview

Aplikacja webowa wizualizująca latarnie morskie Morza Bałtyckiego na interaktywnym, obracalnym globie 3D. Użytkownik może:

- obracać i przybliżać glob,
- klikać markery latarni,
- otwierać panel boczny ze szczegółami (parametry techniczne, zdjęcie, opis, link do Wikipedii),
- zobaczyć animowany pierścień zasięgu światła dla wybranej latarni.

Stan projektu: MVP rozszerzone o dane z sześciu krajów bałtyckich. Aktualnie **54 latarnie**: PL (16), FI (12), LV (7), EE (7), RU (7), LT (5). Wszystkie komentarze, UI i dokumentacja są głównie po polsku.

---

## 2. Technology stack

| Warstwa | Technologia | Wersja / uwagi |
|---------|-------------|----------------|
| Framework | Next.js (App Router) | 14.2.35 |
| Język | TypeScript | 5.4, strict mode włączony |
| UI | React | 18.3 |
| Globe 3D | `react-globe.gl` / `globe.gl` / Three.js | SSR wyłączony dla komponentu globu |
| Styling | Tailwind CSS | 3.4 + autoprefixer |
| Animacje | `framer-motion` | panel boczny |
| Ikony | `lucide-react` | |
| Dane | Statyczny GeoJSON | `/public/data/lighthouses.geojson` |
| Tekstury | NASA Blue Marble + topologia + nocne niebo | `/public/textures/` |
| Linting | ESLint | `next/core-web-vitals` |
| CI/CD | GitHub Actions | Node 20, `npm ci`, lint, build |
| Hosting | Vercel | skonfigurowany (`.vercel/project.json`) |

---

## 3. Project structure

```
baltic-lighthouses/
├── .github/workflows/ci.yml         # CI: lint + build na push/PR do main
├── .vercel/project.json             # Identyfikator projektu Vercel
├── public/
│   ├── data/lighthouses.geojson     # Dane 54 latarni (GeoJSON FeatureCollection)
│   ├── images/lighthouses/*.jpg     # Lokalne zdjęcia (42 pliki)
│   └── textures/                    # Tekstury globu i tła
├── scripts/
│   └── fix_image_urls.py            # Naprawia URL-e zdjęć Wikimedia w GeoJSON
├── src/
│   ├── app/
│   │   ├── globals.css              # Tailwind + style globalne
│   │   ├── layout.tsx               # Layout główny, metadata, lang="pl"
│   │   ├── page.tsx                 # Strona główna — Server Component, pobiera dane
│   │   └── LighthousesClient.tsx    # Klient — zarządza stanem, renderuje glob i panel
│   ├── components/
│   │   ├── Globe3D.tsx              # Komponent globu 3D (react-globe.gl)
│   │   └── LighthousePanel.tsx      # Panel boczny ze szczegółami latarni
│   └── types/
│       └── lighthouse.ts            # Interfejsy TypeScript + helpery
├── next.config.js                   # React Strict Mode OFF, obrazki Wikimedia
├── package.json                     # Skrypty i zależności
├── postcss.config.js                # Tailwind + autoprefixer
├── tailwind.config.js               # Konfiguracja Tailwind (kolory amber)
└── tsconfig.json                    # Strict TS, path alias `@/*` → `./src/*`
```

---

## 4. Main module divisions

### `src/app/page.tsx`
Server Component (async). Odpowiedzialny za:
- odczyt `/public/data/lighthouses.geojson` po stronie serwera (`fs.readFile`) w czasie buildu,
- konwersję `featureToLighthouse()`,
- obsługę błędów ładowania danych,
- przekazanie gotowej listy latarni do `<LighthousesClient>`.

### `src/components/LighthousesClient.tsx`
Komponent kliencki (`'use client'`). Odpowiedzialny za:
- przechowywanie stanu `selected`,
- obsługę zdarzeń `onSelect` / `onClose`,
- renderowanie `<Globe3D>` i `<LighthousePanel>` oraz nakładki UI (tytuł, statystyki).

### `src/components/Globe3D.tsx`
Najważniejszy komponent wizualny. Uwagi krytyczne:
- `react-globe.gl` jest importowany dynamicznie z `{ ssr: false }`, ponieważ biblioteka korzysta z `window`/`document`.
- `reactStrictMode` jest **wyłączony** w `next.config.js`, bo podwójne mountowanie w dev psuje Globe.gl.
- Używa `forwardRef` / callback ref, aby uzyskać dostęp do instancji globu i animować `pointOfView()`.
- Markery renderowane przez `pointsData`; kolory zależą od `status` i `lightColor`.
- Po kliknięciu markera glob zoomuje do latarni i wyświetla pierścień zasięgu (`ringsData`).
- Na urządzeniach mobilnych ładowana jest mniejsza tekstura (`earth-blue-marble.jpg`), na desktopie `earth-8k.webp` (~1,8 MB, WebP 8K).

### `src/components/LighthousePanel.tsx`
Panel boczny ze szczegółami latarni:
- Animowany przez `framer-motion` (`AnimatePresence`).
- Wyświetla zdjęcie: najpierw próbuje `/images/lighthouses/{id}.jpg`, w razie błędu fallback na `imageUrl` (Wikimedia).
- Pokazuje parametry: rok budowy, wysokość, zasięg, charakterystykę światła, współrzędne itp.
- Tłumaczy status i kod kraju na język polski.

### `src/types/lighthouse.ts`
Centralne typy i helpery:
- `Lighthouse` — główny interfejs.
- `LighthouseFeature`, `LighthouseCollection` — typy GeoJSON.
- `LIGHT_COLORS`, `COUNTRY_COLORS`, `COUNTRY_NAMES` — stałe wizualne.
- `featureToLighthouse()` — mapowanie GeoJSON Feature → `Lighthouse`.

---

## 5. Build and test commands

Wszystkie komendy uruchamiaj z katalogu głównego projektu:

```bash
# Instalacja zależności
npm install

# Serwer deweloperski (http://localhost:3000)
npm run dev

# Build produkcyjny
npm run build

# Uruchomienie produkcyjnego serwera Next.js
npm start

# Linting ESLint
npm run lint
```

Brak skonfigurowanych testów jednostkowych ani E2E. CI uruchamia tylko `npm run lint` i `npm run build`.

---

## 6. Code style guidelines

- **Język**: komentarze i dokumentacja po polsku; nazwy zmiennych/funkcji po angielsku.
- **Komponenty React**: functional components + hooks. Client components oznaczaj dyrektywą `'use client'`.
- **Eksporty**: preferowane **named exports**. Wyjątek: `page.tsx` i `layout.tsx` wymagają `export default`.
- **Nazewnictwo plików**: PascalCase dla komponentów (`Globe3D.tsx`), camelCase dla utils/typów.
- **Typy**: zawsze TypeScript; unikaj `any`.
- **Tailwind**: klasy używane inline; kolory projektowe to ciemne tło `#0a0a1a` i bursztynowy akcent `#f59e0b`.
- **Dane**: wszystkie informacje o latarniach trzymane w `/public/data/lighthouses.geojson`. Nie hardkoduj listy latarni w komponentach.

---

## 7. Testing instructions

Obecnie projekt **nie zawiera testów automatycznych**. Walidacja odbywa się przez:

1. `npm run lint` — sprawdzenie lintingu.
2. `npm run build` — sprawdzenie, czy aplikacja się buduje.
3. Ręczne testy UI:
   - glob się ładuje,
   - markery są klikalne,
   - panel boczny otwiera się i zamyka,
   - zdjęcia lokalne/Wikimedia ładują się poprawnie,
   - responsywność na urządzeniach mobilnych.

Jeśli dodajesz testy, użyj narzędzi kompatybilnych z Next.js + React (np. Vitest + React Testing Library). Pamiętaj, że `<Globe3D>` wymaga mockowania z powodu dynamicznego importu `react-globe.gl`.

---

## 8. Security considerations

- **Obrazki zewnętrzne**: w `next.config.js` dozwolony jest tylko hostname `upload.wikimedia.org`. Nie dodawaj szerokich wildcardów bez potrzeby.
- **Dane użytkownika**: aplikacja nie zbiera, nie przetwarza ani nie wysyła danych osobowych. Wszystkie dane są statyczne.
- **Zależności**: regularnie aktualizuj `next`, `react`, `three` i inne pakiety związane z WebGL — biblioteki 3D mogą mieć podatności parserów.
- **Skrypt Pythona** (`scripts/fix_image_urls.py`) wykonuje zapytania HTTP do API Wikimedia; używaj go lokalnie, nie w CI, aby uniknąć rate-limitów i zależności od zewnętrznych usług podczas buildu.
- **Zmienne środowiskowe**: projekt ich nie używa. Pliki `.env` i `.env.local` są w `.gitignore`.

---

## 9. Deployment process

- **Vercel**: projekt jest skonfigurowany do deployu na Vercel (plik `.vercel/project.json`).
- **GitHub Actions**: przy każdym pushu/PR do `main` uruchamia się CI z krokami:
  1. Checkout
  2. Setup Node.js 20 + cache npm
  3. `npm ci`
  4. `npm run lint`
  5. `npm run build`
- Build Next.js generuje stronę statyczną/dynamiczną; tekstury globu są serwowane z `/public` (desktop `earth-8k.webp` ~1,8 MB, mobile `earth-blue-marble.jpg` ~1,4 MB).

---

## 10. Important conventions and caveats

- **React Strict Mode musi być wyłączony** — Globe.gl nie działa poprawnie przy podwójnym renderowaniu w deweloperskim Strict Mode.
- **Globe.gl wymaga klienta**: nigdy nie importuj `react-globe.gl` bezpośrednio w komponentach serwerowych; zawsze używaj `dynamic(() => import(...), { ssr: false })`.
- **Zdjęcia**: system preferuje lokalne pliki w `/public/images/lighthouses/{id}.jpg`; `imageUrl` z GeoJSON to fallback (zazwyczaj Wikimedia).
- **Współrzędne**: w GeoJSON zapisane jako `[lng, lat]`; w `Lighthouse.coordinates` również `[lng, lat]`.
- **Zasięg światła**: `rangeNm` w milach morskich; pierścień wizualny skalowany przez `0.054` do jednostek globu.
- **Mobile**: wykrywane po szerokości ekranu < 768 px lub obecności touch; ładowana jest lżejsza tekstura ziemi.
- **Język UI**: `lang="pl"`, formatowanie liczb przez `'pl-PL'`.

---

## 11. Useful file paths

- Główna strona: `src/app/page.tsx`
- Glob 3D: `src/components/Globe3D.tsx`
- Panel boczny: `src/components/LighthousePanel.tsx`
- Typy i helpery: `src/types/lighthouse.ts`
- Dane: `public/data/lighthouses.geojson`
- Tekstury: `public/textures/`
- Lokalne zdjęcia: `public/images/lighthouses/`
- Skrypt naprawczy URL-i: `scripts/fix_image_urls.py`
- Konfiguracja Next.js: `next.config.js`
- CI: `.github/workflows/ci.yml`
