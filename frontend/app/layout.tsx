// app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Noto_Serif } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '../lib/i18n/LanguageProvider';

const inter = Inter({ subsets: ['latin'] });
const notoSerif = Noto_Serif({ 
  subsets: ['latin'],
   weight: ["200","300", "400", "500", "600", "700", "800", "900"], 
  variable: '--font-noto-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Base Architecture',
  description: 'Proyecto que incluye la arquitectura basica para reutilización en los aplicativos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} ${notoSerif.variable}`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}