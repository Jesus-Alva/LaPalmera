import BannerComponent from "../../components/features/dashboard/BannerComponent";
import EspaciosComponent from "../../components/features/dashboard/EspaciosComponent";
import CelebrationsComponent from "../../components/features/dashboard/CelebrationsComponent";
import ServiceComponent from "../../components/features/dashboard/ServiceComponent";
import PartyPackageComponent from "../../components/features/dashboard/PartyPackageComponent";
import LocationComponent from "../../components/features/dashboard/LocationComponent";

import {
    getPublicBanners,
    getPublicSpaces,
    getPublicCelebrations,
    getPublicPackages,
    getPublicLocations,
} from "../../lib/api/public";

export default async function Page() {
    const [banners, spaces, celebrations, packages, locations] = await Promise.all([
        getPublicBanners(),
        getPublicSpaces(),
        getPublicCelebrations(),
        getPublicPackages(),
        getPublicLocations(),
    ]);

    return (
        <div className="min-h-screen bg-gradient-to-br ">
            {/* Seccion: Banner */}
            <BannerComponent banner={banners[0] ?? null} />

            {/* Seccion: Nuestros espacios */}
            <EspaciosComponent spaces={spaces} />

            {/* Sección: Celebraciones */}
            <CelebrationsComponent celebrations={celebrations} />

            <ServiceComponent />

            <PartyPackageComponent packages={packages} />

            <LocationComponent location={locations[0] ?? null} />
        </div>
    );
};
