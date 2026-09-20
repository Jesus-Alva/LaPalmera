import type { Metadata } from "next";
import TitleGalleryComponent from "../../components/features/gallery/TitleGalleryComponent";
import GalleryImageComponent from "../../components/features/gallery/GalleryImageComponent";
import { getPublicGalleryCategories, getPublicGalleryImages } from "../../lib/api/public";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
    return buildPageMetadata({
        title: 'Galeria de Eventos | La Palmera',
        description: 'Conoce el Jardín de Eventos.',
        path: '/gallery',
    });
}

export default async function Page() {
    const [categories, images] = await Promise.all([
        getPublicGalleryCategories(),
        getPublicGalleryImages(),
    ]);

    return (
        <section className="min-h-screen">
            <TitleGalleryComponent />
            <GalleryImageComponent categories={categories} images={images} />
        </section>
    )
}
