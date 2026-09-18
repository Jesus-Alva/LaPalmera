import TitleGalleryComponent from "../../components/features/gallery/TitleGalleryComponent";
import GalleryImageComponent from "../../components/features/gallery/GalleryImageComponent";
import { getPublicGalleryCategories, getPublicGalleryImages } from "../../lib/api/public";

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
