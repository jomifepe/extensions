import { PaginationOptions } from "@raycast/utils/dist/types";
import { PaginatedListings } from "./api.types";
import { RemaxListing } from "./remax.types";
import fetch from "cross-fetch";

export const fetchRemaxListings = async (pagination?: PaginationOptions): Promise<PaginatedListings> => {
  const { page = 1 } = pagination ?? {};

  const result = await fetch("https://www.remax.pt/api/Listing/PaginatedMultiMatchSearch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "https://www.remax.pt",
    },
    body: JSON.stringify({
      filters: [
        {
          field: "businessTypeID",
          operationType: "int",
          operator: "=",
          value: "1",
          label: "buy",
        },
        {
          field: "Region2ID",
          operationType: "string",
          operator: "=",
          value: "523",
        },
        {
          field: "listingTypeID",
          operationType: "multiple",
          operator: "=",
          value: "1,11,3,24",
        },
        {
          field: "listingPrice",
          operationType: "int",
          operator: "Range",
          value: "100000;250000",
        },
        {
          field: "numberOfBedrooms",
          operationType: "int",
          operator: "Range",
          value: "2;",
        },
        {
          field: "listingClassID",
          operationType: "int",
          operator: "=",
          value: "1",
        },
        {
          field: "isSpecialExclusive",
          operator: "=",
          operationType: "string",
          value: "false",
        },
      ],
      pageNumber: page + 1,
      pageSize: 20,
      sort: ["-ContractDate"],
      searchValue: "Leiria",
    }),
  });

  if (!result.ok) throw new Error("Failed to fetch listings");

  const data = (await result.json()) as RemaxListing;

  return {
    data: data.results.map((item) => ({
      id: String(item.id),
      title: item.customDisplayTitle,
      price: item.listingPriceText,
      image: `https://i.maxwork.pt/l-search/${item.listingPictureUrl}`,
      images: item.listingPictures.map((picture) => `https://i.maxwork.pt/l-search/${picture}`),
      url: `https://www.remax.pt/pt/imoveis/${item.descriptionTags}/${item.listingTitle}`,
      location: item.regionName3 || item.regionName2 || item.regionName1,
    })),
    hasMore: data.hasNextPage,
  };
};
