'use client';

import BannerComponent from "../../components/features/package/bannerComponent";
import NavbarComponent from "../../components/layouts/navbarComponent";
import { ROUTES_IMAGES } from "../constants/routes";

const Page: React.FC = () => {
    return (
        <div className="min-h-screen">
            <NavbarComponent logo={ROUTES_IMAGES.logo}/>

            <BannerComponent srcBanner={ROUTES_IMAGES.paquetes.src_banner}/>

            
        </div>
    )
}

export default Page;