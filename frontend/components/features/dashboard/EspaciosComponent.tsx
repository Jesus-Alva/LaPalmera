"use client";

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
        <section className="container mx-auto px-4 py-8 md:py-12 mt-18.75 md:mt-20">
            {/* Subtítulo */}
            <h2 className="font-manrope font-bold uppercase tracking-widest text-center text-yellow-800 mb-4 text-sm md:text-base">
                {t("inicio.espacios.desc")}
            </h2>

            {/* Título principal */}
            <h2 className="font-noto-serif text-3xl md:text-4xl lg:text-5xl font-normal text-center text-gray-800 mb-8 md:mb-12">
                {t("inicio.espacios.title")}
            </h2>

            {/* Grid de tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Tarjeta 1 */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 flex flex-col h-full">
                    <div className="relative w-full pt-[75%] overflow-hidden rounded-t-2xl">
                        <Image
                            src={espacios.lvl1[0]}
                            alt="Frontend"
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                    </div>
                    <div className="p-6 md:p-8 lg:p-10 flex flex-col flex-grow">
                        <h3 className="font-noto-serif font-normal text-2xl md:text-3xl lg:text-4xl mb-2">
                            {t("inicio.espacios.lvl1.title")}
                        </h3>
                        <span className="font-noto-serif font-light text-base md:text-lg text-gray-600">
                            {t("inicio.espacios.lvl1.desc")}
                        </span>
                    </div>
                </div>

                {/* Tarjeta 2 */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 flex flex-col h-full">
                    <div className="relative w-full pt-[75%] overflow-hidden rounded-t-2xl">
                        <Image
                            src={espacios.lvl2[0]}
                            alt="Frontend"
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                    </div>
                    <div className="p-6 md:p-8 lg:p-10 flex flex-col flex-grow">
                        <h3 className="font-noto-serif font-normal text-2xl md:text-3xl lg:text-4xl mb-2">
                            {t("inicio.espacios.lvl2.title")}
                        </h3>
                        <span className="font-noto-serif font-light text-base md:text-lg text-gray-600">
                            {t("inicio.espacios.lvl2.desc")}
                        </span>
                    </div>
                </div>

                {/* Tarjeta 3 */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 flex flex-col h-full">
                    <div className="relative w-full pt-[75%] overflow-hidden rounded-t-2xl">
                        <Image
                            src={espacios.lvl3[0]}
                            alt="Frontend"
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                    </div>
                    <div className="p-6 md:p-8 lg:p-10 flex flex-col flex-grow">
                        <h3 className="font-noto-serif font-normal text-2xl md:text-3xl lg:text-4xl mb-2">
                            {t("inicio.espacios.lvl3.title")}
                        </h3>
                        <span className="font-noto-serif font-light text-base md:text-lg text-gray-600">
                            {t("inicio.espacios.lvl3.desc")}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EspaciosComponent;