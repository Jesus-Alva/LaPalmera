'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Faq, FaqCreate } from '@/src/types/faq';
import { createFaq, updateFaq } from '@/lib/api/faqs';

interface Props {
  initialData?: Faq;
}

export default function FAQForm({ initialData }: Props) {
  const router = useRouter();
  const [question, setQuestion] = useState(initialData?.question || '');
  const [answer, setAnswer] = useState(initialData?.answer || '');
  const [pageId, setPageId] = useState<number | null>(initialData?.page_id ?? null);
  const [sortOrder, setSortOrder] = useState<number | null>(initialData?.sort_order ?? 0);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data: FaqCreate = {
        question,
        answer,
        page_id: pageId,
        sort_order: sortOrder,
        is_active: isActive,
      };

      if (initialData) {
        await updateFaq(initialData.id, data);
      } else {
        await createFaq(data);
      }

      router.push('/faqs');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {initialData ? 'Editar FAQ' : 'Nuevo FAQ'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700">Pregunta *</label>
          <input
            id="question"
            type="text"
            required
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="answer" className="block text-sm font-medium text-gray-700">Respuesta *</label>
          <textarea
            id="answer"
            rows={4}
            required
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700">Orden</label>
          <input
            id="sort_order"
            type="number"
            value={sortOrder ?? ''}
            onChange={e => setSortOrder(e.target.value ? parseInt(e.target.value) : 0)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center">
          <input
            id="is_active"
            type="checkbox"
            checked={isActive}
            onChange={e => setIsActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">Activo</label>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => router.push('/faqs')} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={loading} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
            {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
}