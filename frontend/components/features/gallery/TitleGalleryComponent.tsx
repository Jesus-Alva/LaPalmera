"use client";

import React from "react";
import { useTranslation } from "../../../lib/hooks/useTranslation";
const TitleGalleryComponent: React.FC = () => {
    const {t} = useTranslation();
    return (
        <section className="py-12 md:py-16 mt-8 md:mt-16">
            <div className="container mx-auto px-4">
                <div className="text-center lg:text-left lg:w-1/2">
                    <p className="font-manrope font-bold uppercase tracking-widest text-yellow-800 mb-3 text-sm md:text-base">
                        {t("gallery.subtitle")}
                    </p>
                    <h3 className="font-noto-serif text-3xl md:text-4xl lg:text-5xl font-normal text-black w-full lg:w-2/3">
                        {t("gallery.title")}
                    </h3>
                    <div className="w-full my-6 font-manrope">
                        {t("gallery.desc")}
                    </div>
                </div>
                <div className="w-full">
                    
                </div>
            </div>
        </section>
    );
}
export default TitleGalleryComponent;