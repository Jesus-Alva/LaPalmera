import { IconType } from "react-icons";
import { FaFacebook, FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa";

export interface SocialLink {
  key: string;
  label: string;
  href: string;
  Icon: IconType;
  /** Color de marca en hex, usado para el resplandor (glow) al hacer hover. */
  hoverColor: string;
  /** Clase(s) de Tailwind para el relleno de fondo al hacer hover (sólido o degradado). */
  bgClass: string;
}

/**
 * Fuente única de las redes sociales del negocio, usada tanto por el Footer
 * como por las burbujas flotantes del sitio público.
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
    href: "https://wa.me/525520221427?text=" + encodeURIComponent("Hola, me gustaría más información sobre La Palmera."),
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
