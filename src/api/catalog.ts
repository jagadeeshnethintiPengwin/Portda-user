import { api } from './client';
import type { Port, Category } from './types';

export const catalogApi = {
  ports: (q?: string) =>
    api<Port[]>(
      `/catalog/ports${q ? `?q=${encodeURIComponent(q)}` : ''}`,
      {},
      true,
    ),

  categories: () => api<Category[]>('/catalog/categories', {}, true),

  category: (idOrSlug: string | number) =>
    api<Category>(`/catalog/categories/${idOrSlug}`, {}, true),
};
