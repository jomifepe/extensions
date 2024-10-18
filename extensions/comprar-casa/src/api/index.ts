import { usePromise } from "@raycast/utils";
import { fetchRemaxListings } from "./remax";
import { Agencies, ApiFetcherOptions, PaginatedListings } from "./api.types";
import { showToast, Toast } from "@raycast/api";
import { useRef } from "react";
import { fetchIdealistaListings } from "./idealista";

const fetchers: Record<Agencies, (options: ApiFetcherOptions) => Promise<PaginatedListings>> = {
  remax: fetchRemaxListings,
  idealista: fetchIdealistaListings,
};

export const useFetchListings = (source: Agencies) => {
  const toastRef = useRef<Toast>();
  const abortable = useRef<AbortController>();
  const fetcher = fetchers[source];

  return usePromise((_) => (pagination) => fetcher({ pagination, abortController: abortable.current }), [fetcher], {
    execute: !!fetcher,
    onWillExecute: async () => {
      toastRef.current = await showToast({ style: Toast.Style.Animated, title: "Fetching listings..." });
    },
    onData: () => toastRef.current?.hide(),
    onError: () => toastRef.current?.hide(),
    abortable,
  });
};
