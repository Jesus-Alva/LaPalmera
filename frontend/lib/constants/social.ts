import { IconType } from "react-icons";
import { FaFacebook, FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa";
import { SocialNetworks } from "@/src/types/siteSettings";

export interface SocialLink {
  key: keyof SocialNetworks;
  label: string;
  href: string;
  Icon: IconType;
  /** Color de marca en hex, usado para el resplandor (glow) al hacer hover. */
  hoverColor: string;
  /** Clase(s) de Tailwind para el relleno de fondo al hacer hover (sólido o degradado). */
  bgClass: string;
}

/** Mensaje predeterminado del enlace de WhatsApp en las burbujas flotantes. */
export const SOCIAL_WHATSAPP_MESSAGE = "Hola, me gustaría más información sobre La Palmera.";

/**
 * Metadata visual de las redes sociales del negocio (ícono, colores, etiqueta),
 * usada tanto por el Footer como por las burbujas flotantes del sitio público.
 * El `href` aquí es solo un respaldo: el valor real y editable por un
 * administrador vive en site_settings → Redes sociales (panel /settings),
 * ver `buildSocialLinks`.
 */
export const SOCIAL_LINKS: SocialLink[] = [
  {
    key: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61563419831448",
    Icon: FaFacebook,
    hoverColor: "#1877F2",
    bgClass: "bg-[#1877F2]",
  },
  {
    key: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/la_palmera_jardin_de_eventos_/",
    Icon: FaInstagram,
    hoverColor: "#DD2A7B",
    bgClass: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    href: "https://wa.me/525520221427?text=" + encodeURIComponent(SOCIAL_WHATSAPP_MESSAGE),
    Icon: FaWhatsapp,
    hoverColor: "#25D366",
    bgClass: "bg-[#25D366]",
  },
  {
    key: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@vg.eventos_jlpalmera",
    Icon: FaTiktok,
    hoverColor: "#010101",
    bgClass: "bg-[#010101]",
  },
];

/**
 * Combina la metadata visual fija (`SOCIAL_LINKS`) con los enlaces reales
 * guardados en site_settings.social_networks. Si `socialNetworks` no llega
 * (BD sin datos o fetch fallido), cada red conserva su `href` de respaldo.
 */
export function buildSocialLinks(socialNetworks?: Partial<SocialNetworks>): SocialLink[] {
  return SOCIAL_LINKS.map((link) => {
    const value = socialNetworks?.[link.key];
    if (!value) return link;

    if (link.key === "whatsapp") {
      return { ...link, href: `${value}?text=${encodeURIComponent(SOCIAL_WHATSAPP_MESSAGE)}` };
    }
    return { ...link, href: value };
  });
}
