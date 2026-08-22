"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Space } from "../../../src/types/space";
import PackageImageCarousel from "../package/PackageImageCarousel";

interface Props {
    space: Space | null;
    onClose: () => void;
}

const SpaceDetailModal: React.FC<Props> = ({ space, onClose }) => {
    const images = space?.images_url && space.images_url.length > 0
        ? space.images_url
        : space?.image_url
            ? [space.image_url]
            : [];

    return (
        <AnimatePresence>
            {space && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative w-full pt-[56%] bg-gray-100 rounded-t-2xl overflow-hidden">
                            {images.length > 0 ? (
                                <PackageImageCarousel
                                    images={images}
                                    alt={space.title}
                                    sizes="(max-width: 768px) 100vw, 672px"
                                    fallbackSrc=""
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                                    Sin imágenes registradas
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Cerrar"
                                className="absolute top-3 right-3 z-30 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 md:p-8">
                            <h3 className="font-noto-serif font-normal text-2xl md:text-3xl text-gray-800 mb-3">
                                {space.title}
                            </h3>
                            <p className="font-noto-serif font-light text-base md:text-lg text-gray-600 whitespace-pre-line">
                                {space.description || "Sin descripción disponible."}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SpaceDetailModal;
