interface image {
    src: string;
    alt: string;
}

export interface origin {
    title: string;
    subtitle: string;
    description: string[];
    image1: image;
    image2: image;
}

interface info {
    name: string;
    rol: string;
    photo: image;
}

export interface team {
    title: string;
    subtitle: string;
    teamList: info[];
}