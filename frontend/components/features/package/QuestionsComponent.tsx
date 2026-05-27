'use client';

import { useState } from 'react';
import { useTranslation } from '../../../lib/hooks/useTranslation';

interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

const QuestionsComponent: React.FC = () => {
const { t } = useTranslation();

    const faqs: FAQItem[] = t('package.question.questions', { returnObjects: true }) as FAQItem[];

    const [openId, setOpenId] = useState<number | null>(null);

    const toggleItem = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <section className="container mx-auto md:py-10 lg:py-16 my-18.5 px-4">
            <h2 className="w-full text-secondary text-center text-3xl lg:text-5xl md:text-3xl font-noto-serif font-normal tracking-tight mb-12">
                Preguntas Frecuentes
            </h2>

            <div className="w-full md:w-5/6 lg:w-2/3 mx-auto space-y-5">
                {faqs.map((faq) => (
                    <div
                        key={faq.id}
                        className="bg-gray-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-300"
                    >
                        <button
                            onClick={() => toggleItem(faq.id)}
                            className="w-full flex items-center justify-between p-5 text-left font-medium text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                            aria-expanded={openId === faq.id}
                        >
                            <span className="text-lg font-noto-serif">{faq.question}</span>
                            <svg
                                className={`w-5 h-5 text-secondary transition-transform duration-300 ${
                                    openId === faq.id ? 'rotate-180' : 'rotate-0'
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <div
                            className={`transition-all duration-300 ease-in-out overflow-hidden bg-white ${
                                openId === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                        >
                            <div className="font-manrope p-5 pt-0 text-gray-600 leading-relaxed border-t border-gray-100 mt-2">
                                {faq.answer}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default QuestionsComponent;