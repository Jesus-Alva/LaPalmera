'use client';

import BannerComponent from "../../components/features/aboutus/BannerComponent";
import OriginComponent from "../../components/features/aboutus/OriginComponent";
import TeamComponent from "../../components/features/aboutus/TeamComponent";

import { useTranslation } from "../../lib/hooks/useTranslation";
import { ROUTES_IMAGES } from "../constants/routes";

import { origin, team } from "@/src/types/aboutus";

const Page: React.FC = () => {
    const {t} = useTranslation()
    const dataOrigin = t("aboutus.origin", {returnObjects: true}) as origin;
    const dataTeam = t("aboutus.team", {returnObjects: true}) as team;

    return (
        <section className="min-h-screen">
            <BannerComponent srcBanner={ROUTES_IMAGES.nosotros.src_banner} />
            <OriginComponent data={dataOrigin} />
            <TeamComponent data={dataTeam} />
        </section>
    )
}

export default Page;