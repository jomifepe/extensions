import { useCachedPromise } from "@raycast/utils";
import { fetchRemaxListings } from "./remax";
import { Agencies, ApiFetcherOptions, PaginatedListings } from "./api.types";
import { showToast, Toast } from "@raycast/api";
import { useRef } from "react";
import { fetchIdealistaListings } from "./idealista";
import { fetchImoveisMaisListings } from "./imoveisMais";
import { fetchImovirtualListings } from "./imovirtual";

type FetchFn = (options: ApiFetcherOptions) => Promise<PaginatedListings>;
const fetchers: Record<Agencies, FetchFn> = {
  remax: fetchRemaxListings,
  idealista: fetchIdealistaListings,
  imoveisMais: fetchImoveisMaisListings,
  imovirtual: fetchImovirtualListings,
};

export const useFetchListings = (source: Agencies) => {
  const toastRef = useRef<Toast>();
  const abortable = useRef<AbortController>();
  const fetcher = fetchers[source];

  return useCachedPromise(
    (fetch: FetchFn) => (pagination) => fetch({ pagination, abortController: abortable.current }),
    [fetcher],
    {
      execute: !!fetcher,
      onWillExecute: async () => {
        toastRef.current = await showToast({ style: Toast.Style.Animated, title: "Fetching listings..." });
      },
      onData: () => toastRef.current?.hide(),
      onError: () => toastRef.current?.hide(),
      abortable,
      failureToastOptions: { message: "Failed to fetch listings" },
    },
  );
};
