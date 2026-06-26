export interface PagedListResponse<T> {
  items: T[];
  total: number;
  page?: number;
  size?: number;
  totalPages?: number;
  totalElements?: number;
}

/** Fetches every page from a paginated tenant list endpoint (0-based pages). */
export async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<PagedListResponse<T>>,
  pageSize = 100,
): Promise<{ items: T[]; total: number }> {
  const first = await fetchPage(0);
  const total = first.total ?? first.totalElements ?? first.items.length;
  const totalPages =
    first.totalPages ?? (total > 0 ? Math.ceil(total / pageSize) : 1);

  if (totalPages <= 1) {
    return { items: first.items ?? [], total };
  }

  const pages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => fetchPage(index + 1)),
  );

  return {
    items: [first.items ?? [], ...pages.map((page) => page.items ?? [])].flat(),
    total,
  };
}
