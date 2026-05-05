'use client';
import Image from "next/image";

import { ROUTES_IMAGES } from "../constants/routes";
import NavbarComponent from "../../components/layouts/navbarComponent";
import BannerComponent from "../../components/features/dashboard/bannerComponent";
import EspaciosComponent from "../../components/features/dashboard/espaciosComponent";
import CelebrationsComponent from "../../components/features/dashboard/celebrationsComponent";
import ServiceComponent from "../../components/features/dashboard/serviceComponent";

import { useLang } from "../../lib/i18n/LanguageProvider";
import { useTranslation } from "../../lib/hooks/useTranslation";

const Page: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br ">
            {/* Header simple */}
            <NavbarComponent logo={ROUTES_IMAGES.logo} />

            {/* Seccion: Banner */}
            <BannerComponent srcBanner={ROUTES_IMAGES.dashboard} />

            {/* Seccion: Nuestros espacios */}
            <EspaciosComponent espacios={ROUTES_IMAGES.inicio.espacios}/>

            {/* Sección: Celebraciones */}
            <CelebrationsComponent src={ROUTES_IMAGES.inicio.celebrations} />

            <ServiceComponent />

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-300">
                        {t('footer_line1')}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                        {t('footer_line2')}
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Page;