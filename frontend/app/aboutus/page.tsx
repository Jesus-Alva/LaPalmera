import BannerComponent from "../../components/features/aboutus/BannerComponent";
import OriginComponent from "../../components/features/aboutus/OriginComponent";
import TeamComponent from "../../components/features/aboutus/TeamComponent";

import { ROUTES_IMAGES } from "../constants/routes";
import { getPublicTeamMembers } from "../../lib/api/public";

export default async function Page() {
    const teamMembers = await getPublicTeamMembers();

    return (
        <section className="min-h-screen">
            <BannerComponent srcBanner={ROUTES_IMAGES.nosotros.src_banner} />
            <OriginComponent />
            <TeamComponent teamMembers={teamMembers} />
        </section>
    )
}
