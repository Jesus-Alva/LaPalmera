import BannerComponent from "../../components/features/package/BannerComponent";
import PackagesComponent from "../../components/features/package/PackagesComponent";
import QuestionsComponent from "../../components/features/package/QuestionsComponent";

import { ROUTES_IMAGES } from "../constants/routes";
import { getPublicPackages } from "../../lib/api/public";

export default async function Page() {
    const packages = await getPublicPackages({ limit: 200 });

    return (
        <div className="min-h-screen">
            <BannerComponent srcBanner={ROUTES_IMAGES.paquetes.src_banner}/>

            <PackagesComponent packages={packages} />

            <QuestionsComponent />
        </div>
    )
}
