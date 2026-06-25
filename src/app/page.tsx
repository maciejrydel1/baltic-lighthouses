import { readFile } from 'fs/promises';
import path from 'path';
import { LighthousesClient } from '@/components/LighthousesClient';
import { Lighthouse, LighthouseCollection, featureToLighthouse } from '@/types/lighthouse';

async function fetchLighthouses(): Promise<Lighthouse[]> {
  const filePath = path.join(process.cwd(), 'public/data/lighthouses.geojson');
  const raw = await readFile(filePath, 'utf-8');
  const data: LighthouseCollection = JSON.parse(raw);
  return data.features.map(featureToLighthouse);
}

export default async function Home() {
  let lighthouses: Lighthouse[] = [];
  let error: string | null = null;

  try {
    lighthouses = await fetchLighthouses();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Nieznany błąd podczas ładowania danych';
  }

  if (error) {
    return (
      <main className="relative w-screen h-screen overflow-hidden bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-2xl font-bold text-white/90 mb-2">Błąd ładowania danych</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
          >
            Spróbuj ponownie
          </a>
        </div>
      </main>
    );
  }

  return <LighthousesClient lighthouses={lighthouses} />;
}
