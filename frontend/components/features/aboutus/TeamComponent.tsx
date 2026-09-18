"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { useTranslation } from "../../../lib/hooks/useTranslation";
import { TeamMember } from "@/src/types/teamMember";

interface ComponentProps {
    teamMembers: TeamMember[];
}

const getImageUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL}${path}`;

const TeamComponent: React.FC<ComponentProps> = ({ teamMembers }) => {
    const { t } = useTranslation();

    if (teamMembers.length === 0) return null;

    return (
        <div className="py-12 md:py-16 mt-8 md:mt-16">
            <div className="container mx-auto">
                {/* Subtítulo */}
                <h2 className="font-manrope font-bold uppercase tracking-widest text-center text-yellow-800 mb-4 text-sm md:text-base">
                    {t("aboutus.team.subtitle")}
                </h2>

                {/* Título principal */}
                <h2 className="font-noto-serif text-3xl md:text-4xl lg:text-5xl font-normal text-center text-gray-800 mb-8 md:mb-12">
                    {t("aboutus.team.title")}
                </h2>

                <div className="flex flex-wrap justify-center mx-auto gap-6 md:gap-8">
                    {teamMembers.map((member) => (
                        <div key={member.id} className="bg-white rounded shadow-md flex flex-col w-full sm:w-[45%] lg:w-1/4">
                            <div className="relative w-full pt-[75%] overflow-hidden rounded-t-2xl bg-gray-100">
                                {member.photo_path ? (
                                    <Image
                                        src={getImageUrl(member.photo_path)}
                                        alt={member.photo_alt || member.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            <div className="p-3 flex flex-col grow text-center">
                                <h3 className="font-noto-serif font-normal text-2xl">
                                    {member.name}
                                </h3>
                                <span className="font-noto-serif font-light text-base md:text-lg text-gray-600">
                                    {member.role}
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
