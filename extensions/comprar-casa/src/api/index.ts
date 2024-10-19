import { useCachedPromise } from "@raycast/utils";
import { fetchRemaxListings } from "./remax";
import { Agencies, ApiFetcherOptions, Listing } from "./api.types";
import { showToast, Toast } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { fetchIdealistaListings } from "./idealista";
import { fetchImoveisMaisListings } from "./imoveisMais";
import { fetchImovirtualListings } from "./imovirtual";
import { fetchSupercasaListings } from "./supercasa";
import { PaginationOptions } from "@raycast/utils/dist/types";
import { PaginatedData, UsePromisePaginationOptions } from "../helpers/usePagination";
import { fetchBpiExpressoListings } from "./bpiExpresso";

type FetchFn = (options: ApiFetcherOptions) => Promise<PaginatedData<Listing>>;
const fetchers: Record<Agencies, FetchFn> = {
  remax: fetchRemaxListings,
  idealista: fetchIdealistaListings,
  imoveisMais: fetchImoveisMaisListings,
  imovirtual: fetchImovirtualListings,
  supercasa: fetchSupercasaListings,
  bpiExpresso: fetchBpiExpressoListings,
};

export const useFetchListings = (source: Agencies, paginationProps: UsePromisePaginationOptions<Listing>) => {
  const fetcher = fetchers[source];

  const toastRef = useRef<Toast>();
  const abortable = useRef<AbortController>();
  const [data, setData] = useState<Listing[]>();

  const { data: _, ...result } = useCachedPromise(
    (fetch: FetchFn, pagination: PaginationOptions) => fetch({ pagination, abortController: abortable.current }),
    [fetcher, paginationProps.pagination],
    {
      onWillExecute: async () => {
        const { page } = paginationProps.pagination;
        const title = page > 1 ? "Fetching more listings..." : "Fetching listings...";
        const message = page > 1 ? `Page ${page}` : undefined;
        toastRef.current = await showToast({ style: Toast.Style.Animated, title, message });
      },
      onData: (data) => {
        paginationProps.onData(data);
        setData((current) => [...(current ?? []), ...data.data]);
        toastRef.current?.hide();
      },
      onError: () => toastRef.current?.hide(),
      failureToastOptions: { message: "Failed to fetch listings" },
      abortable,
    },
  );

  useEffect(() => setData(undefined), [fetcher]);

  return { data, ...result };
};
