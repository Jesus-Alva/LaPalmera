"use client";
import Image from "next/image";

import { origin } from "@/src/types/aboutus";
import { useTranslation } from "../../../lib/hooks/useTranslation";

const OriginComponent: React.FC = () => {
    const { t } = useTranslation();
    const data = t("aboutus.origin", { returnObjects: true }) as origin;

    return (
        <section className="py-12 md:py-16 mt-8 md:mt-16">
            <div className="container flex justify-center align-middle mx-auto px-4">
                <div className="text-center lg:text-left lg:w-1/3">
                    <p className="font-manrope font-bold uppercase tracking-widest text-yellow-800 mb-3 text-sm md:text-base">
                        {data.subtitle}
                    </p>
                    <h3 className="font-noto-serif text-3xl md:text-4xl lg:text-5xl font-normal text-black w-full lg:w-2/3">
                        {data.title}
                    </h3>

                    {data.description.map((current, index) => (
                        <div key={index} className="w-full my-6 font-manrope">
                            {current}
                        </div>
                    ))}

                </div>
                <div className="relative w-2/3 flex justify-center items-center py-8 md:py-0">
                    <div className="relative w-full max-w-md mx-auto">
                        <div className="relative z-0">
                            <Image
                                src={data.image1.src}
                                alt={data.image1.alt}
                                width={1500}
                                height={800}
                                className="w-full h-auto object-cover rounded shadow-xl "
                            />
                        </div>
                        {/* Imagen superpuesta (primera imagen, más pequeña y rotada al revés) */}
                        <div className="absolute -bottom-5 -right-14 z-10 w-1/2 md:w-2/5 ">
                            <Image
                                src={data.image2.src}
                                alt={data.image2.alt}
                                width={1000}
                                height={800}
                                className="w-full h-auto object-cover rounded border-5 md:border-8 border-white shadow-xl"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default OriginComponent;