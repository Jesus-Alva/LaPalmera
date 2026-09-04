"use client";

import { useState, useMemo, useEffect } from "react";
import { reservation } from "@/src/types/contact";

import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { getPublicSetting } from "@/lib/api/public";
import { extractWhatsAppPhone } from "@/lib/whatsapp";

interface ComponentProps {
    data: reservation
}

const getMinimumReservationDate = () => {
    const minimumDate = new Date();
    minimumDate.setDate(minimumDate.getDate() + 14);

    const year = minimumDate.getFullYear();
    const month = String(minimumDate.getMonth() + 1).padStart(2, "0");
    const day = String(minimumDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const FormComponent: React.FC<ComponentProps> = ({ data }) => {

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        eventType: "",
        fecha: "",
        guests: 0,
        message: ""
    });

    const minReservationDate = getMinimumReservationDate();

    // Número de WhatsApp al que se envía la reserva, tomado de site_settings
    // (Redes sociales → WhatsApp, editable desde /settings). Mientras carga o si
    // falla, WhatsAppButton usa su propio número de respaldo.
    const [whatsappPhone, setWhatsappPhone] = useState<string | undefined>(undefined);
    useEffect(() => {
        let isMounted = true;

        getPublicSetting('social_networks')
            .then((social) => {
                if (isMounted) setWhatsappPhone(extractWhatsAppPhone(social.whatsapp));
            })
            .catch(() => {});
        return () => {
            isMounted = false;
        };
    }, []);

    const WhatsAppMessage = useMemo(() => {
        const {name, phone, eventType, fecha, guests, message} = formData;

        const lines = [
            `Hola, estoy interesado en reservar.`,
            "",
            "*Mis Datos de Contacto*",
            `Nombre: ${name}`,
            `Teléfono: ${phone}`,
            `Tipo de evento: ${eventType}`,
            `Fecha estimada de mi evento: ${fecha}`,
            `Número de invitados: ${guests}`,
            "",
            `Mensaje o dudas que tengo: ${message || "No tengo dudas al momento"}`
        ];
        return lines.join("\n");
    }, [formData]);

    return (
        <section id="formulario" className="mt-10 bg-gray-100 py-12 md:mt-16 md:py-20">
            <div className="container mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.6fr)] lg:items-center lg:gap-16">
                <div className="space-y-4 text-center lg:text-left">
                    <p className="font-manrope text-xs font-bold uppercase tracking-[0.22em] text-yellow-800">
                        Reserva tu fecha
                    </p>
                    <h2 className="font-noto-serif text-3xl font-normal leading-tight text-secondary sm:text-4xl">
                        {data.title}
                    </h2>
                    <p className="font-manrope text-sm leading-7 text-gray-700 sm:text-base">
                        {data.description}
                    </p>
                </div>
                <div className="rounded-md bg-white p-5 shadow-lg sm:p-8">
                    <form className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                        <div className="w-full">
                            <label htmlFor="floating_name" className="mb-2 block font-manrope text-xs font-bold uppercase tracking-wider text-secondary">
                                Nombre Completo
                            </label>
                            <input
                                type="text"
                                name="floating_name"
                                id="floating_name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="block w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 font-manrope text-sm text-secondary outline-none transition placeholder:text-gray-400 focus:border-secondary focus:bg-white focus:ring-2 focus:ring-primary/40" placeholder="Tu nombre" required />
                        </div>
                        <div className="w-full">
                            <label htmlFor="floating_phone" className="mb-2 block font-manrope text-xs font-bold uppercase tracking-wider text-secondary">
                                Número de Contacto (+52)
                            </label>
                            <input
                                type="text"
                                name="floating_phone"
                                id="floating_phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="block w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 font-manrope text-sm text-secondary outline-none transition placeholder:text-gray-400 focus:border-secondary focus:bg-white focus:ring-2 focus:ring-primary/40" placeholder="55 0000 0000" required />
                        </div>
                        <div className="w-full">
                            <label htmlFor="floating_event" className="mb-2 block font-manrope text-xs font-bold uppercase tracking-wider text-secondary">
                                Tipo de Evento
                            </label>
                            <input
                                type="text"
                                name="floating_event"
                                id="floating_event"
                                value={formData.eventType}
                                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                                className="block w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 font-manrope text-sm text-secondary outline-none transition placeholder:text-gray-400 focus:border-secondary focus:bg-white focus:ring-2 focus:ring-primary/40" placeholder="Boda, cumpleaños..." required />
                        </div>
                        <div className="w-full">
                            <label htmlFor="floating_date" className="mb-2 block font-manrope text-xs font-bold uppercase tracking-wider text-secondary">
                                Fecha Estimada
                            </label>
                            <input
                                type="date"
                                name="fecha_estimada"
                                id="floating_date"
                                value={formData.fecha}
                                min={minReservationDate}
                                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                className="block w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 font-manrope text-sm text-secondary outline-none transition focus:border-secondary focus:bg-white focus:ring-2 focus:ring-primary/40"
                                required
                            />
                        </div>
                        <div className="w-full">
                            <label htmlFor="floating_clients" className="mb-2 block font-manrope text-xs font-bold uppercase tracking-wider text-secondary">
                                Numero de Invitados
                            </label>
                            <input
                                type="number"
                                max={600}
                                min={50}
                                name="floating_clients"
                                id="floating_clients"
                                value={formData.guests}
                                onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
                                className="block w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 font-manrope text-sm text-secondary outline-none transition placeholder:text-gray-400 focus:border-secondary focus:bg-white focus:ring-2 focus:ring-primary/40" placeholder="50" required />
                        </div>
                        <div className="w-full sm:col-span-2">
                            <label htmlFor="floating_dudes" className="mb-2 block font-manrope text-xs font-bold uppercase tracking-wider text-secondary">
                                Mensaje o dudas
                            </label>
                            <textarea 
                                name="floating_dudes" id="floating_dudes" 
                                className="block min-h-32 w-full resize-y rounded border border-gray-300 bg-gray-50 px-4 py-3 font-manrope text-sm text-secondary outline-none transition placeholder:text-gray-400 focus:border-secondary focus:bg-white focus:ring-2 focus:ring-primary/40" 
                                placeholder="Cuéntanos cómo podemos ayudarte" 
                                required 
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>

                        <WhatsAppButton
                            phone={whatsappPhone}
                            message={WhatsAppMessage}
                            className="w-full text-center text-white bg-secondary hover:scale-[1.02] active:scale-100 transform duration-300 rounded border border-transparent px-4 py-3 font-manrope text-sm font-bold uppercase tracking-widest shadow-md transition hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-primary/50 sm:col-span-2"
                        >
                            Enviar WhatsApp
                        </WhatsAppButton>
                    </form>

                </div>
            </div>
        </section>
    )
}

export default FormComponent;