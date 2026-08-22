// app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Noto_Serif, Manrope } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '../lib/i18n/LanguageProvider';
import NavbarComponent from '../components/layouts/NavbarComponent';
import FooterComponent from '../components/layouts/FooterComponent';
import SocialBubbles from '../components/ui/SocialBubbles';
import LoadingScreen from '../components/ui/LoadingScreen';
import { ROUTES_IMAGES } from './constants/routes';
import AuthCheck from '@/components/ui/AuthCheck';
import { buildPageMetadata, SITE_URL } from '../lib/seo';
import { getPublicSetting } from '../lib/api/public';

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

// Metadata por defecto del sitio: se arma en cada request a partir de site_settings
// (secciones `seo`/`branding`, editables desde /settings), y sirve como respaldo
// para cualquier página que no defina su propio `generateMetadata`.
export async function generateMetadata(): Promise<Metadata> {
  const metadata = await buildPageMetadata();
  return {
    ...metadata,
    metadataBase: new URL(SITE_URL),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enlaces reales de redes sociales (site_settings → Redes sociales, editable
  // desde /settings). Si el fetch falla, SocialBubbles usa su respaldo hardcodeado.
  const socialNetworks = await getPublicSetting('social_networks').catch(() => undefined);

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} ${notoSerif.variable} ${manrope.variable}`} suppressHydrationWarning>
        <LanguageProvider>
          {/* Pantalla de carga, Navbar, burbujas de redes sociales y Footer solo visibles en rutas públicas */}
          <AuthCheck>
            <LoadingScreen />
          </AuthCheck>
          <AuthCheck>
            <NavbarComponent logo={ROUTES_IMAGES.logo} />
          </AuthCheck>
          <AuthCheck>
            <SocialBubbles socialNetworks={socialNetworks} />
          </AuthCheck>
          {children}
          <AuthCheck>
            <FooterComponent />
          </AuthCheck>
        </LanguageProvider>
      </body>
    </html>
  )
}