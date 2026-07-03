"use client";

import MapComponent from "../../ui/MapComponent";

import { information } from "@/types/contact";

interface ComponentProps {
    data: information
}
const InformationComponent: React.FC<ComponentProps> = ({ data }) => {
    return (
        <section className="">
            <div className="container mx-auto px-4 flex align-middle gap-4">
                <div className="h-full my-auto w-1/3 space-y-5">
                    <div className="bg-white px-5 py-4 rounded shadow-md">
                        <div className="mx-5">
                            <span className="text-3xl text-secondary font-noto-serif">
                                {data.title}
                            </span>
                        </div>
                        {data.data.map((item, index) => (
                            <div key={index} className="flex flex-col m-5">
                                <span className="font-manrope uppercase text-gray-500 text-sm tracking-wider font-semibold">{item.title}</span>
                                <span className="">{item.value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="bg-secondary px-5 py-4 rounded shadow-md">
                        <div className="m-5">
                            <span className="text-3xl text-white font-noto-serif">
                                {data.schedule.title}
                            </span>
                        </div>
                        <div className="h-0.5 bg-linear-to-r from-secondary via-gray-400/50 to-secondary my-6 mx-5"></div>
                        {data.schedule.data.map((item, index) => (
                            <div key={index} className="flex align-middle justify-between m-5">
                                <span className="font-manrope font-light uppercase text-white text-sm tracking-wider">{item.days}</span>
                                <span className="font-manrope text-white font-light">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-2/3">
                    <MapComponent />
                </div>
            </div>
        </section>
    )
}

export default InformationComponent;