import { redirect } from 'next/navigation';
import { getServerToken, fetchProtectedData } from '@/app/lib/auth-server';
import { getFaqs } from '@/lib/api/faqs';
import FaqsTable from '@/components/forms/Faqs/FAQTable';

export default async function FaqsPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  const faqs = await getFaqs(token, { limit: 50 });

  return <FaqsTable initialFaqs={faqs} />;
}