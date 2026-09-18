'use client';

import { useRouter } from 'next/navigation';
import { Faq } from '@/src/types/faq';
import { deleteFaq } from '@/lib/api/faqs';
import DataTable from '@/components/ui/DataTable';
import { ColumnDef, ActionDef } from '@/src/types/table';

interface Props {
  initialFaqs: Faq[];
}

export default function FAQTable({ initialFaqs }: Props) {
  const router = useRouter();

  const handleDelete = async (faq: Faq) => {
    await deleteFaq(faq.id);
    router.refresh();
  };

  const columns: ColumnDef<Faq>[] = [
    {
      key: 'question',
      label: 'Pregunta',
      align: 'left',
      render: (faq) => (
        <span className="font-medium text-gray-800">{faq.question}</span>
      )
    },
    {
      key: 'answer',
      label: 'Respuesta',
      align: 'left',
      render: (faq) => (
        <span className="text-gray-600 block max-w-xs truncate" title={faq.answer}>{faq.answer}</span>
      )
    },
    {
      key: 'sort_order',
      label: 'Orden',
      align: 'center',
      render: (faq) => faq.sort_order ?? '—'
    },
    {
      key: 'is_active',
      label: 'Estado',
      align: 'center',
      render: (faq) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${faq.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <span className={`w-2 h-2 rounded-full mr-1.5 ${faq.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
          {faq.is_active ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ];

  const actions: ActionDef<Faq>[] = [
    {
      label: 'Editar',
      variant: 'primary',
      onClick: (faq) => router.push(`/faqs/${faq.id}/edit`),
      icon: <span>✏️</span>,
    },
  ];

  return (
    <DataTable
      data={initialFaqs}
      columns={columns}
      onDelete={handleDelete}
      resourceName="FAQ"
      newItemLink="/faqs/new"
      emptyMessage="No hay FAQs creados todavía."
      actions={actions}
    />
  );
}