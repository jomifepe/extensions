import { PaginatedData } from "../helpers/usePagination";
import { ApiFetcherOptions, Listing } from "./api.types";
import { BpiExpressoListingPage } from "./bpiExpresso.types";
import fetch from "cross-fetch";

export const fetchBpiExpressoListings = async (options?: ApiFetcherOptions): Promise<PaginatedData<Listing>> => {
  const { pagination, abortController } = options ?? {};
  const { page = 1 } = pagination ?? {};

  const result = await fetch(
    `https://api.bpiexpressoimobiliario.pt/api/v1/announces/?type=buy&kinds=apartment&kinds=house&district=Leiria&county=Leiria&range_value=price&range_value_from=100000&range_value_to=250000&typologies=t2&typologies=t3&typologies=t4&typologies=t5&typologies=t5_more&all_selected_characteristics=true&days_inserted=all&is_paa=false&only_bpi_properties=false&only_partner_properties=false&only_particular_properties=false&page=${page}&page_size=20&sort=latest`,
    {
      headers: {
        accept: "application/json, text/plain, */*",
        origin: "https://bpiexpressoimobiliario.pt",
      },
      signal: abortController?.signal,
    },
  );

  if (!result.ok) throw new Error("Failed to fetch listings from BPI Expresso");

  const data = (await result.json()) as BpiExpressoListingPage;
  console.log({ data });

  return {
    data: data.results.map((item) => ({
      id: item.id,
      type: item.typology,
      title: item.title,
      price: `${item.price}€`,
      image: item.gallery[0],
      images: item.gallery,
      url: `https://bpiexpressoimobiliario.pt/${item.url}`,
      location: item.town || item.county || item.district,
    })),
    listingPageUrl:
      "https://bpiexpressoimobiliario.pt/comprar/apartamento,moradia/t2,t3,t4,t5,maior_t5/leiria/leiria?preco_min=100000&preco_max=250000&ordenar_por=data_mais_recente",
    hasMore: data.count > data.page * data.pageSize,
  };
};
