export type Agencies = "remax";

export type Pagination = {
  page?: number;
  pageSize?: number;
};

export type PaginatedListings = {
  data: Listing[];
  hasMore: boolean;
}

export type ListingResult = {
  totalPages: number;
  total: number;
  page: number;
  pageSize: number;
  results: Listing[];
};

export type Listing = {
  title: string;
  price: string;
  id: string;
  url: string;
  image: string;
  images: string[];
  location: string;
};
