export interface Faq {
  id: number;
  question: string;
  answer: string;
  page_id: number | null;
  sort_order: number | null;
  is_active: boolean;
}

export interface FaqCreate {
  question: string;
  answer: string;
  page_id?: number | null;
  sort_order?: number | null;
  is_active?: boolean;
}

export interface FaqUpdate {
  question?: string;
  answer?: string;
  page_id?: number | null;
  sort_order?: number | null;
  is_active?: boolean;
}