import { redirect } from 'next/navigation';
import { getServerToken, fetchProtectedData } from '@/app/lib/auth-server';
import { getFaq } from '@/lib/api/faqs';
import FaqForm from '@/components/forms/Faqs/FAQForm';

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) redirect('/login');

  const faq = await getFaq(Number(id), token);

  return <FaqForm initialData={faq} />;
}