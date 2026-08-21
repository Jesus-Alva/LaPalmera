import BannerComponent from "../../components/features/package/BannerComponent";
import PackagesComponent from "../../components/features/package/PackagesComponent";
import QuestionsComponent from "../../components/features/package/QuestionsComponent";

import { ROUTES_IMAGES } from "../constants/routes";
import { getPublicPackages, getPublicBanners } from "../../lib/api/public";

export default async function Page() {
    const [packages, banners] = await Promise.all([
        getPublicPackages({ limit: 200 }),
        getPublicBanners({ page: "paquetes" }),
    ]);

    return (
        <div className="min-h-screen">
            <BannerComponent banner={banners[0] ?? null} fallbackSrc={ROUTES_IMAGES.paquetes.src_banner} />

            <PackagesComponent packages={packages} />

            <QuestionsComponent />
        </div>
    )
}
