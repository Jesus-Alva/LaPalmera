'use client';

import NavbarComponent from "../../components/layouts/navbarComponent";
import BannerComponent from "../../components/features/package/bannerComponent";
import PackagesComponent from "../../components/features/package/packagesComponent";
import { ROUTES_IMAGES } from "../constants/routes";

const Page: React.FC = () => {
    return (
        <div className="min-h-screen">
            <BannerComponent srcBanner={ROUTES_IMAGES.paquetes.src_banner}/>

            <PackagesComponent />
        </div>
    )
}

export default Page;