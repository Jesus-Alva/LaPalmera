'use client';

import TitleGalleryComponent from "../../components/features/gallery/TitleGalleryComponent";
import GalleryImageComponent from "../../components/features/gallery/GalleryImageComponent";
const Page: React.FC = () => {
    return (
        <section className="min-h-screen">
            <TitleGalleryComponent />
            <GalleryImageComponent />
        </section>
    )
}

export default Page;