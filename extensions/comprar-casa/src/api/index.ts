import { usePromise } from "@raycast/utils"
import { fetchRemaxListings } from "./remax"

const fetchers = {
  'remax': fetchRemaxListings
}

export const useFetchListings = (source: 'remax') => {
  return usePromise(fetchers[source])
}