// app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Noto_Serif, Manrope } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '../lib/i18n/LanguageProvider';

const inter = Inter({ subsets: ['latin'] });
const notoSerif = Noto_Serif({ 
  subsets: ['latin'],
  weight: ["200","300", "400", "500", "600", "700", "800", "900"], 
  variable: '--font-noto-serif',
  display: 'swap',
});

const manrope = Manrope({ 
  subsets: ['latin'],
  weight: ["200","300", "400", "500", "600", "700", "800"], 
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'La Palmera',
  description: 'Jardín de Eventos La Palmera',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} ${notoSerif.variable} ${manrope.variable}`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}