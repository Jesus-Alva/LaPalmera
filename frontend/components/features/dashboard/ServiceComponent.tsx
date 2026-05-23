'use client';

import { FaUtensils } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { FaRegCalendarAlt } from "react-icons/fa";
import { useTranslation } from "../../../lib/hooks/useTranslation";

const ServiceComponent: React.FC = () => {
    const { t } = useTranslation();
    return (
        <section className="py-16 my-18.75">
            <div className="container mx-auto">
                <h2 className="font-noto-serif text-5xl font-normal text-center text-gray-800 mb-12">
                    {t('inicio.services.title')}
                </h2>
                <div className="grid grid-cols-3 gap-11 h-60">
                    <div className="text-center  my-auto">
                        <FaUtensils className="mx-auto mb-4 text-yellow-800 text-4xl" />
                        <h3 className="font-noto-serif text-3xl mb-2 text-black">
                            {t('inicio.services.servicesList.service1.title')}
                        </h3>
                        <p className="text-gray-600 text-base font-noto-serif mx-auto w-2/3">
                            {t('inicio.services.servicesList.service1.desc')}
                        </p>
                    </div>
                    <div className="text-center mt-auto">
                        <BsStars className="mx-auto mb-4 text-yellow-800 text-4xl" />
                        <h3 className="font-noto-serif text-3xl mb-2 text-black">
                            {t('inicio.services.servicesList.service2.title')}
                        </h3>
                        <p className="text-gray-600 text-base font-noto-serif mx-auto w-2/3">
                            {t('inicio.services.servicesList.service2.desc')}
                        </p>
                    </div>
                    <div className="text-center my-auto">
                        <FaRegCalendarAlt className="mx-auto mb-4 text-yellow-800 text-4xl" />
                        <h3 className="font-noto-serif text-3xl mb-2 text-black">
                            {t('inicio.services.servicesList.service3.title')}
                        </h3>
                        <p className="text-gray-600 text-base font-noto-serif mx-auto w-2/3">
                            {t('inicio.services.servicesList.service3.desc')}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ServiceComponent;