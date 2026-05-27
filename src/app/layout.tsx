import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Latarnie Bałtyku — Interaktywna mapa 3D',
  description:
    'Eksploruj latarnie morskie Morza Bałtyckiego na interaktywnym globie 3D. Polska, Szwecja, Dania, Niemcy, Finlandia i kraje bałtyckie.',
  keywords: ['latarnie morskie', 'Bałtyk', 'mapa 3D', 'Polska', 'lighthouse', 'Baltic Sea'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="bg-[#0a0a1a] text-white antialiased">{children}</body>
    </html>
  );
}
