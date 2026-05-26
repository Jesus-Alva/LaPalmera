"use client";

import { FaUtensils } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { FaRegCalendarAlt } from "react-icons/fa";
import { useTranslation } from "../../../lib/hooks/useTranslation";

const ServiceComponent: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="py-12 md:py-16 my-12 md:my-18.75">
            <div className="container mx-auto px-4">
                {/* Título */}
                <h2 className="font-noto-serif text-3xl md:text-4xl lg:text-5xl font-normal text-center text-gray-800 mb-8 md:mb-12">
                    {t("inicio.services.title")}
                </h2>

                {/* Grid responsivo: 1 columna en móvil, 2 en tablet, 3 en escritorio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-11">
                    {/* Servicio 1 */}
                    <div className="text-center p-4 md:p-6 ">
                        <FaUtensils className="mx-auto mb-4 text-yellow-800 text-4xl md:text-5xl" />
                        <h3 className="font-noto-serif text-2xl md:text-3xl mb-3 text-black">
                            {t("inicio.services.servicesList.service1.title")}
                        </h3>
                        <p className="text-gray-600 text-sm md:text-base font-noto-serif max-w-md mx-auto px-2">
                            {t("inicio.services.servicesList.service1.desc")}
                        </p>
                    </div>

                    {/* Servicio 2 */}
                    <div className="text-center p-4 md:p-6">
                        <BsStars className="mx-auto mb-4 text-yellow-800 text-4xl md:text-5xl" />
                        <h3 className="font-noto-serif text-2xl md:text-3xl mb-3 text-black">
                            {t("inicio.services.servicesList.service2.title")}
                        </h3>
                        <p className="text-gray-600 text-sm md:text-base font-noto-serif max-w-md mx-auto px-2">
                            {t("inicio.services.servicesList.service2.desc")}
                        </p>
                    </div>

                    {/* Servicio 3 */}
                    <div className="text-center p-4 md:p-6">
                        <FaRegCalendarAlt className="mx-auto mb-4 text-yellow-800 text-4xl md:text-5xl" />
                        <h3 className="font-noto-serif text-2xl md:text-3xl mb-3 text-black">
                            {t("inicio.services.servicesList.service3.title")}
                        </h3>
                        <p className="text-gray-600 text-sm md:text-base font-noto-serif max-w-md mx-auto px-2">
                            {t("inicio.services.servicesList.service3.desc")}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServiceComponent;