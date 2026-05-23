'use client';

import { FaRegCheckCircle } from "react-icons/fa";

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from "../../../lib/hooks/useTranslation";

const PartyPackageComponent: React.FC = () => {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemWidth, setItemWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    // Calcular el ancho de cada tarjeta basado en el contenedor
    useEffect(() => {
        const updateItemWidth = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                // Obtenemos las clases CSS para saber cuántas columnas se muestran realmente
                // Por simplicidad, asumimos 3 en lg, 2 en md, 1 en sm. Pero podemos detectar el estilo computado.
                // Usamos matchMedia para saber cuántos elementos se muestran en cada breakpoint
                let columns = 1;
                if (window.matchMedia('(min-width: 1024px)').matches) columns = 3;
                else if (window.matchMedia('(min-width: 768px)').matches) columns = 2;
                else columns = 1;
                const width = containerWidth / columns;
                setItemWidth(width);
            }
        };
        updateItemWidth();
        window.addEventListener('resize', updateItemWidth);
        return () => window.removeEventListener('resize', updateItemWidth);
    }, []);

    const packageList = t('inicio.partyPackage.packageList', { returnObjects: true }) as Record<string, any>;

    if (!packageList || typeof packageList !== 'object') return null;

    const packages = Object.values(packageList);
    const totalPackages = packages.length;
    const itemsToShow = 3; // Número de elementos visibles (se ajusta por CSS en responsive)



    const canPrev = currentIndex > 0;
    const canNext = currentIndex + itemsToShow < totalPackages;

    const goPrev = () => {
        if (canPrev) setCurrentIndex(prev => prev - 1);
    };
    const goNext = () => {
        if (canNext) setCurrentIndex(prev => prev + 1);
    };

    // Desplazamiento en píxeles: cada paso mueve el ancho de una tarjeta
    const translateX = -currentIndex * itemWidth;

    return (
        <section className="container mx-auto py-16 my-18.75">
            <p className="font-manrope font-bold uppercase tracking-widest text-center text-yellow-800 mb-4">
                {t('inicio.partyPackage.desc')}
            </p>
            <h2 className="font-noto-serif text-5xl font-normal text-center text-gray-800 mb-12">
                {t('inicio.partyPackage.title')}
            </h2>

            <div className="relative overflow-hidden" ref={containerRef}>
                <div
                    ref={trackRef}
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(${translateX}px)` }}
                >
                    {packages.map((pkgData, idx) => {
                        const title = pkgData.title;
                        const desc = pkgData.desc;
                        const services = pkgData.services as Record<string, string | string[]>;

                        const hrs = getStringValue(services.hrs);
                        const food = getStringValue(services.food);
                        const carpa = getStringValue(services.carpa);
                        const ambiente = getStringValue(services.ambiente);
                        const parking = getStringValue(services.parking);
                        const drinks = normalizeArray(services.drinks);
                        const mobiliario = normalizeArray(services.mobiliario);
                        const staff = normalizeArray(services.staff);

                        return (
                            <div
                                key={idx}
                                className="shrink-0 p-4"
                                style={{ width: itemWidth ? `${itemWidth}px` : 'auto' }}
                            >
                                <div className="bg-white border border-gray-200 shadow-md p-6 flex flex-col h-full">
                                    <div className="w-11/12 h-full mx-auto">
                                        
                                        <h5 className="mb-2 text-3xl font-noto-serif tracking-wider font-semibold text-secondary">
                                            {title}
                                        </h5>
                                        <p className="text-body font-noto-serif">{desc}</p>
                                        <ul className="list-disc m-6 list-inside space-y-1 font-manrope text-sm grow">
                                            <li className="flex items-start gap-2 hover:bg-gray-100 transition-colors duration-300 my-4">
                                                <FaRegCheckCircle className="w-6 h-6 my-auto shrink-0 text-yellow-500" />
                                                {hrs}
                                            </li>
                                            <li className="flex items-start gap-2 hover:bg-gray-100 transition-colors duration-300 my-4">
                                                <FaRegCheckCircle className="w-6 h-6 my-auto shrink-0 text-yellow-500" />
                                                {food}
                                            </li>
                                            {/* {drinks.map((item, i) => (
                                                <li key={`drink-${idx}-${i}`}>{item}</li>
                                            ))}
                                            <li className="flex items-start gap-2 hover:bg-gray-100 transition-colors duration-300 my-4">
                                                <FaRegCheckCircle className="h-8 text-[3rem] my-auto text-yellow-500" />
                                                {carpa}
                                            </li>
                                            {mobiliario.map((item, i) => (
                                                <li key={`mob-${idx}-${i}`} className="flex items-start gap-2 hover:bg-gray-100 transition-colors duration-300 my-4">
                                                    <FaRegCheckCircle className="h-8 text-[3rem] my-auto text-yellow-500" />
                                                    {item}
                                                </li>
                                            ))}
                                            {staff.map((item, i) => (
                                                <li key={`staff-${idx}-${i}` } className="flex items-start gap-2 hover:bg-gray-100 transition-colors duration-300 my-4">
                                                    <FaRegCheckCircle className="h-8 text-[3rem] my-auto text-yellow-500" />
                                                    {item}
                                                </li>
                                            ))} */}
                                            <li className="flex items-start gap-2 hover:bg-gray-100 transition-colors duration-300 my-4">
                                                <FaRegCheckCircle className="w-6 h-6 my-auto shrink-0 text-yellow-500" />
                                                {ambiente}
                                            </li>
                                            <li className="flex items-start gap-2 hover:bg-gray-100 transition-colors duration-300 my-4">
                                                <FaRegCheckCircle className="w-6 h-6 my-auto shrink-0 text-yellow-500" />
                                                {parking}
                                            </li>
                                        </ul>
                                        <button className="w-full mt-auto font-noto-serif uppercase p-5 border border-secondary text-secondary hover:bg-secondary hover:text-primary transition-colors duration-300">
                                            Más Detalles
                                        </button>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Botones de navegación (solo si hay más de 3 paquetes) */}
            {totalPackages > 3 && (
                <div className="flex justify-center mt-8 gap-4">
                    <button
                        onClick={goPrev}
                        disabled={!canPrev}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${canPrev
                                ? 'bg-yellow-800 text-white hover:bg-yellow-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        ← Anterior
                    </button>
                    <button
                        onClick={goNext}
                        disabled={!canNext}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${canNext
                                ? 'bg-yellow-800 text-white hover:bg-yellow-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Siguiente →
                    </button>
                </div>
            )}
        </section>
    );
};

// Funciones auxiliares (iguales que antes)
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

export default PartyPackageComponent;