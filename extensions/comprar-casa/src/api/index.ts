import { usePromise } from "@raycast/utils";
import { fetchRemaxListings } from "./remax";
import { Agencies, ListingResult, Pagination } from "./api.types";

const fetchers: Record<Agencies, (pagination?: Pagination) => Promise<ListingResult>> = {
  remax: fetchRemaxListings,
};

export const useFetchListings = (source: Agencies) => {
  return usePromise(fetchers[source]);
};
