'use client';

import BannerComponent from "../../components/features/package/bannerComponent";
import PackagesComponent from "../../components/features/package/packagesComponent";
import QuestionsComponent from "../../components/features/package/questionsComponent";

import { ROUTES_IMAGES } from "../constants/routes";

const Page: React.FC = () => {
    return (
        <div className="min-h-screen">
            <BannerComponent srcBanner={ROUTES_IMAGES.paquetes.src_banner}/>

            <PackagesComponent />

            <QuestionsComponent />
        </div>
    )
}

export default Page;