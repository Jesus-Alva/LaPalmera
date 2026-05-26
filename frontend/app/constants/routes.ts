export const ROUTES_IMAGES = {
    logo: "/images/identidad/Logo.png",
    dashboard: "/images/identidad/Banner.png",
    inicio: {
        url: "/",
        espacios: {
            lvl1: [
                "/images/inicio/espacios/lvl1/garden1.png"
            ],
            lvl2: [
                "/images/inicio/espacios/lvl2/pist1.png"
            ],
            lvl3: [
                "/images/inicio/espacios/lvl3/garden1.png"
            ],
        },
        celebrations: {
            image1: "/images/inicio/celebrations/pista.jpg",
            image2: "/images/inicio/celebrations/altar.jpg"
        }
    },
    paquetes: {
        url: "/package",
        src_banner: "/images/package/banner-mesas.png"
    }
    
} as const;

export const ROUTES_PAGE = {
    inicio: "/",
    paquetes: "/package",
    galeria: "/gallery"
} as const;