"use client";

import Image from "next/image";
import { useTranslation } from "../../../lib/hooks/useTranslation";
import { Space } from "../../../src/types/space";

interface ComponentProps {
    spaces: Space[];
}

const getImageUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${path}`;

const EspaciosComponent: React.FC<ComponentProps> = ({ spaces }) => {
    const { t } = useTranslation();

    if (spaces.length === 0) return null;

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

            {/* Grid de tarjetas, una por espacio activo en BD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {spaces.map((space) => (
                    <div key={space.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 flex flex-col h-full">
                        <div className="relative w-full pt-[75%] overflow-hidden rounded-t-2xl bg-gray-100">
                            {space.image_url && (
                                <Image
                                    src={getImageUrl(space.image_url)}
                                    alt={space.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    unoptimized
                                />
                            )}
                        </div>
                        <div className="p-6 md:p-8 lg:p-10 flex flex-col grow">
                            <h3 className="font-noto-serif font-normal text-2xl md:text-3xl lg:text-4xl mb-2">
                                {space.title}
                            </h3>
                            <span className="font-noto-serif font-light text-base md:text-lg text-gray-600">
                                {space.description}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default EspaciosComponent;
