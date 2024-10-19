import { Pagination } from "../helpers/usePagination";

export type Agencies = "remax" | "idealista" | "imoveisMais" | "imovirtual" | "supercasa" | "bpiExpresso";

export type ApiFetcherOptions = {
  pagination?: Pagination;
  abortController?: AbortController;
}

export type ListingResult = {
  totalPages: number;
  total: number;
  page: number;
  pageSize: number;
  results: Listing[];
};

export type Listing = {
  id: string;
  type: string;
  url: string;
  title: string;
  price: string;
  image?: string;
  images?: string[];
  location?: string;
};
