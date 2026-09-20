// app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Noto_Serif, Manrope } from 'next/font/google';
import './globals.css';
import NavbarComponent from '../components/layouts/NavbarComponent';
import FooterComponent from '../components/layouts/FooterComponent';
import SocialBubbles from '../components/ui/SocialBubbles';
import PromotionsButton from '../components/ui/PromotionsButton';
import LoadingScreen from '../components/ui/LoadingScreen';
import { ROUTES_IMAGES } from './constants/routes';
import AuthCheck from '@/components/ui/AuthCheck';
import { buildPageMetadata, SITE_URL } from '../lib/seo';
import { getPublicSetting, getPublicPackages } from '../lib/api/public';
import { getServerToken, fetchProtectedData } from './lib/auth-server';
import { User } from '../src/types/user';
import JsonLd from '@/components/seo/JsonLd';

const inter = Inter({ subsets: ['latin'] });
const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: '--font-noto-serif',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
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
  const [socialNetworks, packages, token] = await Promise.all([
    getPublicSetting('social_networks').catch(() => undefined),
    getPublicPackages({ limit: 200 }).catch(() => []),
    getServerToken(),
  ]);
  // "Promociones" = paquetes con fecha de disponibilidad establecida
  // (date_available_start), a diferencia de los paquetes permanentes.
  const promotionalPackages = packages.filter((pkg) => !!pkg.date_available_start);

  // Usuario con sesión iniciada (si la hay): el Navbar público lo muestra en vez
  // del selector de idioma que ya no existe (el sitio quedó solo en español). Se
  // pide el perfil completo (no solo lo que trae el JWT, que no incluye display_name)
  // para poder mostrar su nombre real y no solo el correo.
  let navbarUser: { displayName: string } | null = null;
  if (token) {
    try {
      const profile = await fetchProtectedData<User>('/user/me');
      navbarUser = { displayName: profile.display_name || profile.email };
    } catch {
      navbarUser = null;
    }
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} ${notoSerif.variable} ${manrope.variable}`} suppressHydrationWarning>
        <head>
          <JsonLd />
        </head>
        {/* Pantalla de carga, Navbar, burbujas de redes sociales y Footer solo visibles en rutas públicas */}
        <AuthCheck>
          <LoadingScreen />
        </AuthCheck>
        <AuthCheck>
          <NavbarComponent logo={ROUTES_IMAGES.logo} user={navbarUser} />
        </AuthCheck>
        <AuthCheck>
          <SocialBubbles socialNetworks={socialNetworks} />
        </AuthCheck>
        <AuthCheck>
          <PromotionsButton packages={promotionalPackages} />
        </AuthCheck>
        {children}
        <AuthCheck>
          <FooterComponent isLoggedIn={!!navbarUser} />
        </AuthCheck>
      </body>
    </html>
  )
}