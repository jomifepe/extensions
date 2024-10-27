import { useCachedPromise, useCachedState } from "@raycast/utils";
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
import { fetchAngariaxListings } from "./angariax";

type FetchFn = (options: ApiFetcherOptions) => Promise<PaginatedData<Listing>>;
const fetchers: Record<Agencies, FetchFn> = {
  remax: fetchRemaxListings,
  idealista: fetchIdealistaListings,
  imoveisMais: fetchImoveisMaisListings,
  imovirtual: fetchImovirtualListings,
  supercasa: fetchSupercasaListings,
  bpiExpresso: fetchBpiExpressoListings,
  angariax: fetchAngariaxListings,
};

export const useFetchListings = (source: Agencies, paginationProps: UsePromisePaginationOptions<Listing>) => {
  const fetcher = fetchers[source];

  const toastRef = useRef<Toast>();
  const abortable = useRef<AbortController>();
  const [data, setData] = useState<Listing[]>();
  const { saveFetchedAt, wasLastFetchedRecently } = useLastFetchedAt();

  const wasRecentlyFetched = wasLastFetchedRecently(source);
  const {
    data: fetchData,
    revalidate,
    ...result
  } = useCachedPromise(
    (fetch: FetchFn, pagination: PaginationOptions) => fetch({ pagination, abortController: abortable.current }),
    [fetcher, paginationProps.pagination],
    {
      onWillExecute: async () => {
        if (wasRecentlyFetched) return;
        const { page } = paginationProps.pagination;
        const title = page > 1 ? "Fetching more listings..." : "Fetching listings...";
        const message = page > 1 ? `Page ${page}` : undefined;
        toastRef.current = await showToast({ style: Toast.Style.Animated, title, message });
      },
      onData: (newData) => {
        paginationProps.onData(newData, data ? (newData.data[0]?.id ?? null) : null);
        setData((current) => [...(current ?? []), ...newData.data]);
        toastRef.current?.hide();
        saveFetchedAt(source);
      },
      onError: () => toastRef.current?.hide(),
      failureToastOptions: { message: "Failed to fetch listings" },
      execute: !wasRecentlyFetched,
      abortable,
    },
  );

  useEffect(() => {
    setData(undefined);
    paginationProps.reset();
  }, [fetcher]);

  const refetch = () => {
    setData(undefined);
    paginationProps.reset();
    revalidate();
  };

  return { data: data ?? fetchData?.data, listingsPageUrl: fetchData?.listingPageUrl, refetch, ...result };
};

type LastFetchedAtMap = Record<Agencies, string | null>;
const lastFetchedAtMapInitialState = Object.fromEntries(
  Object.entries(fetchers).map(([key]) => [key, null]),
) as LastFetchedAtMap;

function useLastFetchedAt() {
  const [lastFetchedAtMap, setLastFetchedAtMap] = useCachedState<LastFetchedAtMap>(
    "lastFetchedAtMap",
    lastFetchedAtMapInitialState,
  );

  const saveFetchedAt = (source: Agencies) => {
    setLastFetchedAtMap((current) => ({ ...current, [source]: new Date().toISOString() }));
  };

  const wasLastFetchedRecently = (source: Agencies) => {
    const lastFetchDate = lastFetchedAtMap[source];
    if (!lastFetchDate) return false;
    const lastFetchedAt = new Date(lastFetchDate);
    if (isNaN(lastFetchedAt.getTime())) return false;
    return new Date().getTime() - lastFetchedAt.getTime() < 1000 * 60 * 30; // less than 30 minutes ago
  };

  return { saveFetchedAt, wasLastFetchedRecently };
}
