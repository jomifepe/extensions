import { usePromise } from "@raycast/utils";
import { fetchRemaxListings } from "./remax";
import { Agencies, PaginatedListings } from "./api.types";
import { PaginationOptions } from "@raycast/utils/dist/types";
import { showToast, Toast } from "@raycast/api";
import { useRef } from "react";

const fetchers: Record<Agencies, (pagination?: PaginationOptions) => Promise<PaginatedListings>> = {
  remax: fetchRemaxListings,
};

export const useFetchListings = (source: Agencies) => {
  const toastRef = useRef<Toast>();
  
  const fetcher = fetchers[source];
  return usePromise(() => (pagination: PaginationOptions) => fetcher(pagination), [], {
    execute: !!fetcher,
    onWillExecute: async () => {
      toastRef.current = await showToast({ style: Toast.Style.Animated, title: "Fetching listings..." });
    },
    onData: () => toastRef.current?.hide(),
    onError: () => toastRef.current?.hide(),
  });
};
