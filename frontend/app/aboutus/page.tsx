import BannerComponent from "../../components/features/aboutus/BannerComponent";
import OriginComponent from "../../components/features/aboutus/OriginComponent";
import TeamComponent from "../../components/features/aboutus/TeamComponent";

import { ROUTES_IMAGES } from "../constants/routes";
import { getPublicTeamMembers, getPublicBanners } from "../../lib/api/public";

export default async function Page() {
    const [teamMembers, banners] = await Promise.all([
        getPublicTeamMembers(),
        getPublicBanners({ page: "nosotros" }),
    ]);

    return (
        <section className="min-h-screen">
            <BannerComponent banner={banners[0] ?? null} fallbackSrc={ROUTES_IMAGES.nosotros.src_banner} />
            <OriginComponent />
            <TeamComponent teamMembers={teamMembers} />
        </section>
    )
}
