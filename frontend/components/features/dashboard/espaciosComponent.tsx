'use client';

import Image from "next/image";
import { useTranslation } from "../../../lib/hooks/useTranslation";
import { ROUTES_IMAGES } from "../../../app/constants/routes";

type Espacios = typeof ROUTES_IMAGES.inicio.espacios;

interface ComponentProps {
    espacios: Espacios;
}

const EspaciosComponent: React.FC<ComponentProps> = ({ espacios }) => {
    const { t } = useTranslation();
    return (
        <section className="container mx-auto px-4 py-12 mt-18.75">

            <h2 className="font-manrope font-bold uppercase tracking-widest text-center text-yellow-800 mb-4">
                {t('inicio.espacios.desc')}
            </h2>

            <h2 className="font-noto-serif text-5xl font-normal text-center text-gray-800 mb-12">
                {t('inicio.espacios.title')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-2xl shadow-lg transform hover:scale-105 transition duration-300">
                    <div className="h-9/12 w-full overflow-hidden rounded-t-2xl">
                        <Image src={espacios.lvl1[0]} alt="Frontend" width={800} height={1000} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-12">
                        <h3 className="font-noto-serif font-normal text-4xl">{t('inicio.espacios.lvl1.title')}</h3>
                        <span className="font-noto-serif font-light text-lg w-full">{t('inicio.espacios.lvl1.desc')}</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg transform hover:scale-105 transition duration-300">
                    <div className="h-9/12 w-full overflow-hidden rounded-t-2xl">
                        <Image src={espacios.lvl2[0]} alt="Frontend" width={800} height={1000} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-12">
                        <h3 className="font-noto-serif font-normal text-4xl">{t('inicio.espacios.lvl2.title')}</h3>
                        <span className="font-noto-serif font-light text-lg w-full">{t('inicio.espacios.lvl2.desc')}</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg transform hover:scale-105 transition duration-300">
                    <div className="h-9/12 w-full overflow-hidden rounded-t-2xl">
                        <Image src={espacios.lvl3[0]} alt="Frontend" width={800} height={1000} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-12">
                        <h3 className="font-noto-serif font-normal text-4xl">{t('inicio.espacios.lvl3.title')}</h3>
                        <span className="font-noto-serif font-light text-lg w-full">{t('inicio.espacios.lvl3.desc')}</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default EspaciosComponent;