"use client";

import { reservation } from "@/types/contact";

interface ComponentProps {
    data: reservation
}

const FormComponent: React.FC<ComponentProps> = ({ data }) => {
    return (
        <section className="bg-gray-100 py-12 md:py-16 mt-8 md:mt-16">
            <div className="container mx-auto px-4 flex align-middle gap-4">
                <div className="h-full my-auto w-1/4 space-y-5">
                    <span className="flex flex-col w-2/3 text-4xl text-secondary font-noto-serif">
                        {data.title}
                    </span>
                    <span className="font-manrope">
                        {data.description}
                    </span>
                </div>
                <div className="w-3/4">
                    <form className="w-2/3 grid grid-cols-2 gap-4 mx-auto">
                        <div className="relative z-0 w-full mb-5 group">
                            <input
                                type="email"
                                name="floating_email"
                                id="floating_email"
                                className="block text-secondary py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer" placeholder=" " required />
                            <label htmlFor="floating_email" className="font-manrope font-semibold text-secondary uppercase absolute text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:inset-s-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                Nombre Completo
                            </label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input
                                type="email"
                                name="floating_email"
                                id="floating_email"
                                className="block text-secondary py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer" placeholder=" " required />
                            <label htmlFor="floating_email" className="font-manrope font-semibold text-secondary uppercase absolute text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:inset-s-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                Correo
                            </label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input 
                                type="email" 
                                name="floating_email" 
                                id="floating_email" 
                                className="block text-secondary py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer" placeholder=" " required />
                            <label htmlFor="floating_email" className="font-manrope font-semibold text-secondary uppercase absolute text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:inset-s-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                Número de Contacto (+52)
                            </label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input 
                                type="email" 
                                name="floating_email" 
                                id="floating_email" 
                                className="block text-secondary py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer" placeholder=" " required />
                            <label htmlFor="floating_email" className="font-manrope font-semibold text-secondary uppercase absolute text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:inset-s-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                Tipo de Evento
                            </label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input 
                                type="email" 
                                name="floating_email" 
                                id="floating_email" 
                                className="block text-secondary py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer" placeholder=" " required />
                            <label htmlFor="floating_email" className="font-manrope font-semibold text-secondary uppercase absolute text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:inset-s-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                Fecha Estimada
                            </label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input 
                                type="email" 
                                name="floating_email" 
                                id="floating_email" 
                                className="block text-secondary py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer" placeholder=" " required />
                            <label htmlFor="floating_email" className="font-manrope font-semibold text-secondary uppercase absolute text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:inset-s-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                Numero de Invitados
                            </label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group col-span-2">
                            <textarea name="floating_email" id="floating_email" className="block text-secondary py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer" placeholder=" " required />
                            <label htmlFor="floating_email" className="font-manrope font-semibold text-secondary uppercase absolute text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:inset-s-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                Mensaje o dudas
                            </label>
                        </div>

                        <button type="submit" className="col-span-2 w-1/2 text-white bg-secondary hover:scale-105 active:scale-100 transform duration-300 rounded box-border border border-transparent font-noto-serif font-extralight tracking-widest uppercase hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
                            Enviar Consulta
                        </button>
                    </form>

                </div>
            </div>
        </section>
    )
}

export default FormComponent;