"use client";

import React from "react";
import Image from "next/image";
import { useTranslation } from "../../lib/hooks/useTranslation";
import { FaMapMarkerAlt, FaFacebook, FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa";

const FooterComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="text-white mt-auto">
      <div className="w-full overflow-hidden">
        <Image
          src="/svg/footer/footer.svg"
          alt="Footer graphic"
          width={600}
          height={400}
          className="w-full h-auto bg-transparent"
        />
      </div>
      <div className="bg-secondary">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

            <div className="space-y-2">
              <h3 className="text-lg font-semibold font-noto-serif uppercase tracking-wider text-primary">
                {t("footer.copyright.title")}
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 md:left-0 md:translate-x-0 w-8 h-0.5 bg-primary rounded-full"></span>

              </h3>
              <p className="text-sm text-gray-300">
                &copy; {new Date().getFullYear()}
                {t("footer.copyright.text")}
              </p>
              <p className="text-xs text-gray-400">
                {t("footer.copyright.extra")}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold font-noto-serif uppercase tracking-wider text-primary">
                {t("footer.location.title")}
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 md:left-0 md:translate-x-0 w-8 h-0.5 bg-primary rounded-full"></span>

              </h3>
              <div className="flex justify-center md:justify-start items-start gap-2">
                <FaMapMarkerAlt className="text-primary mt-1 shrink-0" />
                <p className="text-sm text-gray-300">{t("footer.location.address")}</p>
              </div>
              <a
                href={t("footer.location.href")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-block mt-1"
              >
                {t("footer.location.link")}
              </a>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold font-noto-serif uppercase tracking-wider text-primary relative inline-block">
                {t("footer.social.title")}
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 md:left-0 md:translate-x-0 w-8 h-0.5 bg-primary rounded-full"></span>
              </h3>
              <div className="flex justify-center md:justify-start gap-6 text-4xl">
                <a
                  href={t("footer.social.facebook")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-white/5 hover:bg-[#1877F2] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label="Facebook"
                >
                  <FaFacebook className="transition-colors duration-300 group-hover:text-white" />
                </a>
                <a
                  href={t("footer.social.instagram")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-white/5 hover:bg-gradient-to-br hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label="Instagram"
                >
                  <FaInstagram className="transition-colors duration-300 group-hover:text-white" />
                </a>
                <a
                  href={t("footer.social.whatsapp")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-white/5 hover:bg-[#25D366] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp className="transition-colors duration-300 group-hover:text-white" />
                </a>
                <a
                  href={t("footer.social.tiktok")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-white/5 hover:bg-[#010101] w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label="TikTok"
                >
                  <FaTiktok className="text-2xl md:text-3xl transition-colors duration-300 group-hover:text-white" />
                </a>
              </div>
              <p className="text-sm text-gray-200 font-medium mt-3">
                {t("footer.social.follow")}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 p-6 text-center text-xs text-gray-400">
            {t("footer.extra")}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;