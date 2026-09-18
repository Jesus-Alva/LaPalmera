interface banner {
    title: string;
    subtitle: string;
}

interface data{
    title: string;
    value: string;
}

interface dataTime {
    days: string;
    time: string;
}

interface schedule {
    title: string;
    data: dataTime[];
}

export interface information {
    title: string;
    data: data[];
    schedule: schedule;
}

export interface reservation {
    title: string;
    description: string;
}

export interface contact {
    banner: banner;
    information: information;
    reservation: reservation;
}