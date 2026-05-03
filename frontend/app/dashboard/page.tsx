'use client';
import Image from "next/image";

import { ROUTES_IMAGES } from "../constants/routes";
import NavbarComponent from "../../components/layouts/navbarComponent";
import BannerComponent from "../../components/features/dashboard/bannerComponent";

import { useLang } from "../../lib/i18n/LanguageProvider";
import { useTranslation } from "../../lib/hooks/useTranslation";

const Page: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header simple */}
            <NavbarComponent logo={ROUTES_IMAGES.logo} />

            {/* NUEVO: Dashboard con imagen de fondo */}
            <BannerComponent srcBanner={ROUTES_IMAGES.dashboard} />

            {/* Hero Section */}
            <section id="tecnologias" className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    {t('heroTitle')}
                </h1>
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-700 mb-6">
                    {t('heroSubtitle')}
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                    {t('heroDescription')}
                </p>
                <div className="flex justify-center space-x-4">
                    <span className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-lg hover:bg-blue-700 transition cursor-default">
                        {t('badgeFrontend')}
                    </span>
                    <span className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium shadow-lg hover:bg-green-700 transition cursor-default">
                        {t('badgeBackend')}
                    </span>
                    <span className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium shadow-lg hover:bg-purple-700 transition cursor-default">
                        {t('badgeDevops')}
                    </span>
                </div>
            </section>

            {/* Tecnologías Section */}
            <section className="container mx-auto px-4 py-12">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
                    {t('technologiesHeading')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Frontend Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition duration-300">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-blue-600 text-xl">⚛️</span>
                            </div>
                            <h3 className="text-2xl font-bold text-blue-600">Frontend</h3>
                        </div>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>Next.js 15.5.9</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>React 19.1.0</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>TypeScript 5</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>Tailwind CSS 3.4.1</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>Flowbite & Flowbite-React</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>React Router DOM 6.26.0</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>Axios 1.7.3</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>PostCSS & Autoprefixer</li>
                        </ul>
                    </div>

                    {/* Backend Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition duration-300">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-green-600 text-xl">🐍</span>
                            </div>
                            <h3 className="text-2xl font-bold text-green-600">Backend</h3>
                        </div>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>FastAPI</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>Uvicorn 0.15.0</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>Gunicorn 20.1.0</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>SQLAlchemy 1.4</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>AsyncPG 0.24.0</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>Databases</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>PostgreSQL 2.9.1</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>Python-Jose / Passlib</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>FastAPI-Limiter 0.1.6</li>
                        </ul>
                    </div>

                    {/* DevOps Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition duration-300">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-purple-600 text-xl">🐳</span>
                            </div>
                            <h3 className="text-2xl font-bold text-purple-600">DevOps & Infraestructura</h3>
                        </div>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>Docker</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>Docker Compose</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>PostgreSQL</li>
                        </ul>
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500 italic">
                                Entorno containerizado para desarrollo y producción.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

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