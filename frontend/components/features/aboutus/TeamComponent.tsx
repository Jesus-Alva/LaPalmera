"use client";

import Image from "next/image";
import { team } from "@/src/types/aboutus";

interface ComponentProps {
    data: team
}

const TeamComponent: React.FC<ComponentProps> = ({ data }) => {
    return (
        <div className="py-12 md:py-16 mt-8 md:mt-16">
            <div className="container mx-auto">
                {/* Subtítulo */}
                <h2 className="font-manrope font-bold uppercase tracking-widest text-center text-yellow-800 mb-4 text-sm md:text-base">
                    {data.subtitle}
                </h2>

                {/* Título principal */}
                <h2 className="font-noto-serif text-3xl md:text-4xl lg:text-5xl font-normal text-center text-gray-800 mb-8 md:mb-12">
                    {data.title}
                </h2>

                <div className="flex align-middle justify-center mx-auto gap-6 md:gap-8">
                    {/* Tarjeta 1 */}
                    {data.teamList.map((current, index) => (
                        <div key={index} className="bg-white rounded flex flex-col w-1/3 h-full">
                            <div className="relative w-full h-[50vh] pt-[75%] overflow-hidden rounded-t-2xl">
                                <Image
                                    src={current.photo.src}
                                    alt={current.photo.alt}
                                    fill
                                    className="object-fill"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                            </div>
                            <div className="p-1 flex flex-col grow">
                                <h3 className="font-noto-serif font-normal text-2xl">
                                    {current.name}
                                </h3>
                                <span className="font-noto-serif font-light text-base md:text-lg text-gray-600">
                                    {current.rol}
                                </span>
                            </div>
                        </div>
                    ))}


                </div>
            </div>
        </div>
    )
}

export default TeamComponent;