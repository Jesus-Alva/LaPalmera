"use client";

import { useTranslation } from "../../lib/hooks/useTranslation";

import TitleContactComponent from "../../components/features/contact/TitleContactComponent";
import InformationComponent from "../../components/features/contact/InformationComponent";
import FormComponent from "../../components/features/contact/FormComponent";

import { contact } from "@/src/types/contact";

const Page: React.FC = () => {
    const {t} = useTranslation()

    const dataBanner = t('contact', {returnObjects: true}) as contact; 

    return (
        <div className="min-h-screen">
            <TitleContactComponent  data={dataBanner} />

            <InformationComponent data={dataBanner.information} />

            <FormComponent data={dataBanner.reservation}/>
        </div>
    )
}

export default Page;