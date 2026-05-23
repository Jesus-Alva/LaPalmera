'use client';

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useTranslation } from "../../../lib/hooks/useTranslation";
import { FaRegCheckCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const PackagesComponent: React.FC = () => {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemWidth, setItemWidth] = useState(0);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Obtener datos (esto no es un hook, es seguro)
    const packageList = t('inicio.partyPackage.packageList', { returnObjects: true });

    // useEffect para medir el ancho de la tarjeta
    useEffect(() => {
        if (!trackRef.current) return;
        const firstCard = trackRef.current.querySelector('.package-card');
        if (firstCard) {
            setItemWidth(firstCard.clientWidth);
        }
    }, []);

    // Calcular variables derivadas (necesarias para los efectos)
    const packages = packageList && typeof packageList === 'object' ? Object.values(packageList) : [];
    const totalPackages = packages.length;
    const itemsToShow = 3;
    const canPrev = currentIndex > 0;
    const canNext = currentIndex + itemsToShow < totalPackages;

    // Funciones de navegación
    const goPrev = () => {
        if (canPrev) setCurrentIndex(prev => prev - 1);
        resetAutoPlay();
    };
    const goNext = () => {
        if (canNext) setCurrentIndex(prev => prev + 1);
        resetAutoPlay();
    };

    // Autoplay
    const startAutoPlay = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (canNext) {
                setCurrentIndex(prev => prev + 1);
            } else {
                stopAutoPlay();
            }
        }, 3000);
    };
    const stopAutoPlay = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };
    const resetAutoPlay = () => {
        stopAutoPlay();
        startAutoPlay();
    };

    // useEffect para autoplay
    useEffect(() => {
        if (packages.length === 0) return; // No hay datos, no iniciar
        startAutoPlay();
        return () => stopAutoPlay();
    }, [canNext, currentIndex, packages.length]);

    // Si no hay datos, retornar null (después de todos los hooks)
    if (!packageList || typeof packageList !== 'object' || packages.length === 0) {
        return null;
    }

    const translateX = -currentIndex * itemWidth;

    const handleSelect = (idx: number) => {
        setSelectedIdx(idx);
        resetAutoPlay();
    };
    const clearSelection = () => setSelectedIdx(null);
    const selectedPackage = selectedIdx !== null ? packages[selectedIdx] : null;

    // Pausa al hover
    const handleMouseEnter = () => stopAutoPlay();
    const handleMouseLeave = () => startAutoPlay();

    return (
        <section className="container mx-auto py-16 my-18.5">
            <div
                ref={carouselRef}
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="overflow-hidden">
                    <div
                        ref={trackRef}
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(${translateX}px)` }}
                    >
                        {packages.map((pkgData, idx) => {
                            const title = pkgData.title;
                            const desc = pkgData.desc;
                            const services = pkgData.services as Record<string, string | string[]>;
                            const srcImage = pkgData.srcImage || "/images/package/default_package.jpeg";

                            const hrs = getStringValue(services.hrs);
                            const food = getStringValue(services.food);
                            const drinks = normalizeArray(services.drinks);
                            const isSelected = selectedIdx === idx;

                            return (
                                <div
                                    key={idx}
                                    className="shrink-0 p-4 package-card cursor-pointer"
                                    style={{ width: itemWidth ? `${itemWidth}px` : '33.333%' }}
                                    onClick={() => handleSelect(idx)}
                                >
                                    <div className={`
                                        bg-white rounded-2xl shadow-lg transition-all duration-300
                                        ${isSelected
                                            ? 'bg-secondary scale-105'
                                            : 'hover:scale-105 hover:shadow-xl'}
                                    `}>
                                        <div className="h-64 w-full overflow-hidden rounded-t-2xl">
                                            <Image
                                                src={srcImage}
                                                alt={title}
                                                width={800}
                                                height={600}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className={`p-12 ${isSelected ? 'bg-secondary text-white rounded-b-2xl' : ''}`}>
                                            <h3 className="font-noto-serif font-normal text-4xl">{title}</h3>
                                            <span className="font-noto-serif font-light text-lg w-full">{desc}</span>
                                            <ul className="list-disc list-inside font-manrope text-sm grow">
                                                <li className="flex items-start gap-2 my-2">
                                                    <FaRegCheckCircle className={`w-6 h-6 shrink-0 ${isSelected ? 'text-yellow-500' : 'text-gray-700'}`} />
                                                    {hrs}
                                                </li>
                                                <li className="flex items-start gap-2 my-2">
                                                    <FaRegCheckCircle className={`w-6 h-6 shrink-0 ${isSelected ? 'text-yellow-500' : 'text-gray-700'}`} />
                                                    {food}
                                                </li>
                                                {drinks.map((item, i) => (
                                                    <li key={`drink-${idx}-${i}`} className="flex items-start gap-2 my-2">
                                                        <FaRegCheckCircle className={`w-6 h-6 shrink-0 ${isSelected ? 'text-yellow-500' : 'text-gray-700'}`} />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="flex gap-4 mt-4">
                                                <button
                                                    className={`flex-1 font-noto-serif uppercase p-3 border transition-colors duration-300 rounded ${isSelected ? 'bg-primary text-secondary' : 'border-gray-800 text-gray-800 hover:bg-secondary hover:text-primary'}`}
                                                >
                                                    Más Detalles
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button
                    onClick={goPrev}
                    disabled={!canPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full bg-gray-200 shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaChevronLeft className="text-gray-800 text-5xl" />
                </button>

                <button
                    onClick={goNext}
                    disabled={!canNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full bg-gray-200 shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaChevronRight className="text-gray-800 text-5xl" />
                </button>
            </div>

            {selectedPackage && (
                <div className="mt-16 overflow-hidden transition-all duration-300">
                    {/* Cabecera mejorada con gradiente */}
                    <div className=" text-secondary px-8 py-5 flex justify-between items-center border-b border-yellow-800/20">
                        <h2 className="text-2xl md:text-3xl font-noto-serif font-bold tracking-tight">
                            Detalles del Servicio
                        </h2>
                        <button
                            onClick={clearSelection}
                            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white hover:shadow transition-all duration-200 flex items-center justify-center text-gray-400 hover:scale-105"
                            aria-label="Cerrar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="w-full text-center mb-5">
                            <span className="w-full text-2xl text-yellow-800 font-semibold font-noto-serif tracking-wide">{selectedPackage.title}</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Columna izquierda: imagen y descripción */}
                            <div>
                                <div className="relative h-72 w-full rounded-xl overflow-hidden mb-5 shadow-md">
                                    <Image
                                        src={selectedPackage.srcImage || "/images/package/default_package.jpeg"}
                                        alt={selectedPackage.title}
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                    <p className="text-gray-700 leading-relaxed font-manrope font-light">
                                        {selectedPackage.desc}
                                    </p>
                                </div>
                            </div>

                            {/* Columna derecha: tabla mejorada */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-separate border-spacing-y-2">
                                    <tbody>
                                        {(() => {
                                            const services = selectedPackage.services as Record<string, string | string[]>;
                                            const items = [
                                                { label: "⏱️ Duración", value: getStringValue(services.hrs) },
                                                { label: "🍽️ Alimentación", value: getStringValue(services.food) },
                                                { label: "🥤 Bebidas", value: services.drinks ? normalizeArray(services.drinks) : [] },
                                                { label: "⛺ Carpa / Techo", value: getStringValue(services.carpa) },
                                                { label: "🪑 Mobiliario", value: services.mobiliario ? normalizeArray(services.mobiliario) : [] },
                                                { label: "👥 Personal", value: services.staff ? normalizeArray(services.staff) : [] },
                                                { label: "🎵 Ambiente", value: getStringValue(services.ambiente) },
                                                { label: "🅿️ Estacionamiento", value: getStringValue(services.parking) },
                                            ];
                                            return items.map((item, idx) => (
                                                <tr key={idx} className="group">
                                                    <td className="py-3 pr-5 font-noto-serif font-semibold text-gray-800 w-1/3 align-top bg-gray-50 rounded-l-xl pl-4">
                                                        {item.label}
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600 bg-white rounded-r-xl border-l-2 border-secondary/20">
                                                        {Array.isArray(item.value) ? (
                                                            <ul className="space-y-1.5">
                                                                {item.value.map((v, i) => (
                                                                    <li key={i} className="flex items-start gap-2">
                                                                        <span className="text-green-500 mt-0.5">✓</span>
                                                                        <span className="font-manrope">{v}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <span className="font-light">{item.value || "—"}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Botón de acción adicional */}
                    <div className="px-6 md:px-8 pb-6 flex justify-end">
                        <button className="bg-secondary hover:bg-secondary/90 hover:text-primary text-white font-noto-serif py-2 px-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2">
                            <span>Solicitar este paquete</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

const getStringValue = (value: string | string[] | undefined): string => {
    if (!value) return '';
    if (Array.isArray(value)) return value.join(', ');
    return value;
};

const normalizeArray = (value: string | string[] | undefined): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
};

export default PackagesComponent;