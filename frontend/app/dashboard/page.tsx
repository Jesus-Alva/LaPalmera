'use client';
import Image from "next/image";

import { ROUTES_IMAGES } from "../constants/routes";
import NavbarComponent from "../../components/layouts/navbarComponent";
import BannerComponent from "../../components/features/dashboard/bannerComponent";
import EspaciosComponent from "../../components/features/dashboard/espaciosComponent";

import { useLang } from "../../lib/i18n/LanguageProvider";
import { useTranslation } from "../../lib/hooks/useTranslation";

const Page: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br ">
            {/* Header simple */}
            <NavbarComponent logo={ROUTES_IMAGES.logo} />

            {/* NUEVO: Dashboard con imagen de fondo */}
            <BannerComponent srcBanner={ROUTES_IMAGES.dashboard} />

            {/* Tecnologías Section */}
            <EspaciosComponent espacios={ROUTES_IMAGES.inicio.espacios}/>

            {/* Sección extra: Ventajas */}
            <section className="bg-white py-16 mt-8">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
                        {t('whyHeading')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center p-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">⚡</span>
                            </div>
                            <h3 className="font-semibold text-xl mb-2 text-black">{t('adv_performance_title')}</h3>
                            <p className="text-gray-600">{t('adv_performance_desc')}</p>
                        </div>
                        <div className="text-center p-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🔒</span>
                            </div>
                            <h3 className="font-semibold text-xl mb-2 text-black">{t('adv_security_title')}</h3>
                            <p className="text-gray-600">{t('adv_security_desc')}</p>
                        </div>
                        <div className="text-center p-4">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🐳</span>
                            </div>
                            <h3 className="font-semibold text-xl mb-2 text-black">{t('adv_portability_title')}</h3>
                            <p className="text-gray-600">{t('adv_portability_desc')}</p>
                        </div>
                        <div className="text-center p-4">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">📦</span>
                            </div>
                            <h3 className="font-semibold text-xl mb-2 text-black">{t('adv_scalability_title')}</h3>
                            <p className="text-gray-600">{t('adv_scalability_desc')}</p>
                        </div>
                    </div>
                </div>
            </section>


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