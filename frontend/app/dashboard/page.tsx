'use client';
import Image from "next/image";

import { ROUTES_IMAGES, ROUTES_PAGE } from "../constants/routes";
import BannerComponent from "../../components/features/dashboard/BannerComponent";
import EspaciosComponent from "../../components/features/dashboard/EspaciosComponent";
import CelebrationsComponent from "../../components/features/dashboard/CelebrationsComponent";
import ServiceComponent from "../../components/features/dashboard/ServiceComponent";
import PartyPackageComponent from "../../components/features/dashboard/PartyPackageComponent";
import LocationComponent from "../../components/features/dashboard/LocationComponent";

import { useLang } from "../../lib/i18n/LanguageProvider";
import { useTranslation } from "../../lib/hooks/useTranslation";

const Page: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br ">
            {/* Seccion: Banner */}
            <BannerComponent srcBanner={ROUTES_IMAGES.dashboard} />

            {/* Seccion: Nuestros espacios */}
            <EspaciosComponent espacios={ROUTES_IMAGES.inicio.espacios}/>

            {/* Sección: Celebraciones */}
            <CelebrationsComponent src={ROUTES_IMAGES.inicio.celebrations} />

            <ServiceComponent />

            <PartyPackageComponent />
            
            <LocationComponent />
        </div>
    );
};

export default Page;