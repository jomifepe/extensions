import { useRef, useState } from "react";

export type Pagination = {
  page: number;
};

export type PaginatedData<T> = {
  data: T[];
  listingPageUrl: string;
  hasMore: boolean;
};

export type UsePromisePaginationOptions<T> = {
  pagination: Pagination;
  onData: (data: PaginatedData<T>, selectedItemId?: string | null) => void;
  reset: () => void;
};

export function usePagination<T extends { id: string }>(columns: number) {
  const [page, setPage] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const onDataResultRef = useRef<PaginatedData<T>>();
  const canFetchAgainRef = useRef(true);

  const onData = (data: PaginatedData<T>, selectedItemId?: string | null) => {
    onDataResultRef.current = data;
    canFetchAgainRef.current = data.hasMore;
    if (selectedItemId) setSelectedItemId(selectedItemId);
  };

  const onSelectionChange = (id: string | null) => {
    setSelectedItemId(id);
    if (!onDataResultRef.current) return;

    const { data, hasMore } = onDataResultRef.current;
    if (!hasMore) return;

    const itemIndex = data.findIndex((item) => item.id === id);
    if (!itemIndex || itemIndex < data.length - columns) return;
    if (!canFetchAgainRef.current) return;

    setPage(page + 1);
    canFetchAgainRef.current = false;
  };

  const reset = () => {
    setPage(1);
    setSelectedItemId(null);
  };

  return {
    pagination: { pagination: { page }, onData, reset } as UsePromisePaginationOptions<T>,
    selectedItemId: selectedItemId ?? undefined,
    onSelectionChange,
  };
}
