'use client';
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
        <section className="bg-gray-100 py-16 mt-8">
            <div className="container mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 mx-auto px-4">
                    <div className="col-span-1 md:col-span-3 lg:col-span-6 mx-auto relative inline-block">
                        <div className="relative inline-block">
                            <Image src={src.image2} alt="Celebrations" width={500} height={400} className="block w-auto h-3/12 mx-auto object-cover rounded border-[16px] -rotate-6 border-white shadow-lg" />
                        </div>
                        <Image src={src.image1} alt="Celebrations" width={400} height={550} className="absolute bottom-0 -right-10 w-60 h-auto object-cover rounded border-[16px] rotate-6 border-white shadow-lg -translate-x-4 translate-y-4  z-10" />
                    </div>
                    <div className="col-span-1 md:col-span-2 lg:col-span-4 gap-6">
                        <div className="text-start p-4">
                            <p className="font-manrope font-bold uppercase tracking-widest text-start text-yellow-800 mb-4">{t('inicio.celebrations.desc')}</p>
                            <h3 className="w-1/2 font-noto-serif text-5xl font-light mb-2 text-black">{t('inicio.celebrations.title')}</h3>
                        </div>
                        <div className="text-start p-4">
                            <h3 className="font-noto-serif text-3xl mb-2 text-black">{t('inicio.celebrations.examples.example1.title')}</h3>
                            <p className="text-gray-600">{t('inicio.celebrations.examples.example1.desc')}</p>
                        </div>
                        <div className="text-start p-4">
                            <h3 className="font-noto-serif text-3xl mb-2 text-black">{t('inicio.celebrations.examples.example2.title')}</h3>
                            <p className="text-gray-600">{t('inicio.celebrations.examples.example2.desc')}</p>
                        </div>
                        <div className="text-start p-4">
                            <h3 className="font-noto-serif text-3xl mb-2 text-black">{t('inicio.celebrations.examples.example3.title')}</h3>
                            <p className="text-gray-600">{t('inicio.celebrations.examples.example3.desc')}</p>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    )
}

export default CelebrationsComponent;