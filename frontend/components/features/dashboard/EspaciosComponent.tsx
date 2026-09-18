"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Images } from "lucide-react";
import { useTranslation } from "../../../lib/hooks/useTranslation";
import { Space } from "../../../src/types/space";
import SpaceDetailModal from "./SpaceDetailModal";

interface ComponentProps {
    spaces: Space[];
}

const VISIBLE_COUNT = 3;
const AUTO_ADVANCE_MS = 4000;

const getImageUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL}${path}`;

const EspaciosComponent: React.FC<ComponentProps> = ({ spaces }) => {
    const { t } = useTranslation();
    const [startIndex, setStartIndex] = useState(0);
    const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);

    const isCarousel = spaces.length > VISIBLE_COUNT;

    useEffect(() => {
        if (!isCarousel) return;
        const timer = setInterval(() => {
            setStartIndex((prev) => (prev + 1) % spaces.length);
        }, AUTO_ADVANCE_MS);
        return () => clearInterval(timer);
    }, [isCarousel, spaces.length]);

    if (spaces.length === 0) return null;

    const visibleSpaces = isCarousel
        ? Array.from({ length: VISIBLE_COUNT }, (_, i) => spaces[(startIndex + i) % spaces.length])
        : spaces;

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

            {/* Carrusel de tarjetas: recorrido automático e infinito, siempre 3 visibles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                    {visibleSpaces.map((space) => (
                        <motion.div
                            key={space.id}
                            layout
                            initial={{ opacity: 0, x: 80 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -80 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            onClick={() => setSelectedSpace(space)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") setSelectedSpace(space);
                            }}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full cursor-pointer group"
                        >
                            <div className="relative w-full pt-[75%] overflow-hidden rounded-t-2xl bg-gray-100">
                                {space.image_url && (
                                    <Image
                                        src={getImageUrl(space.image_url)}
                                        alt={space.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        unoptimized
                                    />
                                )}
                                {/* Overlay al hover */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                    <span className="flex items-center gap-2 text-white text-sm font-manrope bg-white/10 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        <Images className="w-4 h-4" />
                                        Ver más imágenes
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 md:p-8 lg:p-10 flex flex-col grow">
                                <h3 className="font-noto-serif font-normal text-2xl md:text-3xl lg:text-4xl mb-2">
                                    {space.title}
                                </h3>
                                <span className="font-noto-serif font-light text-base md:text-lg text-gray-600">
                                    {space.description}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Indicadores del recorrido */}
            {isCarousel && (
                <div className="flex justify-center gap-2 mt-8">
                    {spaces.map((space, i) => (
                        <span
                            key={space.id}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === startIndex ? "w-6 bg-yellow-800" : "w-1.5 bg-gray-300"
                            }`}
                        />
                    ))}
                </div>
            )}

            <SpaceDetailModal space={selectedSpace} onClose={() => setSelectedSpace(null)} />
        </section>
    );
};

export default EspaciosComponent;
