"use client";
import Image from "next/image";
import { useTranslation } from "../../../lib/hooks/useTranslation";
import { ROUTES_IMAGES } from "../../../app/constants/routes";

type Celebrations = typeof ROUTES_IMAGES.inicio.celebrations;

interface ComponentProps {
    src: Celebrations;
}

const CelebrationsComponent: React.FC<ComponentProps> = ({ src }) => {
    const { t } = useTranslation();

    return (
        <section className="bg-gray-100 py-12 md:py-16 mt-8 md:mt-16">
            <div className="container mx-auto px-4">
                {/* Grid: una columna en móvil, dos en escritorio */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">

                    {/* Columna izquierda: imágenes superpuestas */}
                    <div className="relative flex justify-center items-center py-8 md:py-0">
                        <div className="relative w-full max-w-md mx-auto">
                            {/* Imagen de fondo (segunda imagen, más grande y rotada) */}
                            <div className="relative z-0">
                                <Image
                                    src={src.image2}
                                    alt="Celebration background"
                                    width={1000}
                                    height={800}
                                    className="w-full h-auto object-cover rounded border-[12px] md:border-[16px] border-white shadow-xl -rotate-6"
                                />
                            </div>
                            {/* Imagen superpuesta (primera imagen, más pequeña y rotada al revés) */}
                            <div className="absolute bottom-0 right-0 z-10 w-1/2 md:w-2/5 translate-x-2 md:translate-x-4 translate-y-2 md:translate-y-4">
                                <Image
                                    src={src.image1}
                                    alt="Celebration overlay"
                                    width={1000}
                                    height={800}
                                    className="w-full h-auto object-cover rounded border-[12px] md:border-[16px] border-white shadow-xl rotate-6"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Columna derecha: textos */}
                    <div className="space-y-6 md:space-y-8">
                        <div className="text-center lg:text-left">
                            <p className="font-manrope font-bold uppercase tracking-widest text-yellow-800 mb-3 text-sm md:text-base">
                                {t("inicio.celebrations.desc")}
                            </p>
                            <h3 className="font-noto-serif text-3xl md:text-4xl lg:text-5xl font-light text-black w-full lg:w-3/4">
                                {t("inicio.celebrations.title")}
                            </h3>
                        </div>

                        {[1, 2, 3].map((num) => (
                            <div key={num} className="text-center lg:text-left">
                                <h3 className="font-noto-serif text-2xl md:text-3xl mb-2 text-black">
                                    {t(`inicio.celebrations.examples.example${num}.title`)}
                                </h3>
                                <p className="text-gray-600 text-base md:text-lg">
                                    {t(`inicio.celebrations.examples.example${num}.desc`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CelebrationsComponent;