import { ApiFetcherOptions, Listing, PaginatedListings } from "./api.types";
import { load as loadHtml } from "cheerio";
import puppeteer from "puppeteer";

export const fetchImoveisMaisListings = async (options?: ApiFetcherOptions): Promise<PaginatedListings> => {
  const { pagination, abortController } = options ?? {};
  const pageNumber = (pagination?.page ?? 0) + 1;


  const pBrowser = await puppeteer.launch({ headless: true });

  abortController?.signal.addEventListener("abort", () => {
    console.log('ABORT')
    pBrowser.close();
  });

  const pPage = await pBrowser.newPage();
  await pPage.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  );

  await pPage.goto(
    `https://imoveismais.pt/leiria/Imoveis?reference=&imovtn_id=1&imovnature_id=&imovest_id=&distrito_id=10&concelho_id=&freguesia_id=4274&minroom=2&maxroom=&precomin=100000&precomax=250000&areamin=&areamax=&page=${pageNumber}`,
  );
  const content = await pPage.content();
  await pBrowser.close();

  const $ = loadHtml(content);

  const listings = $(".product-block")
    .map((_, element): Listing | undefined => {
      const $$ = $(element);

      const heading = $$.find(".grid_view_title");
      const url = heading.attr("href");

      if (!url) return undefined;

      return {
        url,
        id: url,
        title: heading.text().trim(),
        image: $$.find(".pb-image").attr("data-src"),
        price: $$.find(".block_information .price_imovs").text().trim(),
        type: $$.find(".rooms_wc_area > .info_imovs:first-child").text().trim(),
        location: $$.find(".text-left a").text().trim(),
      };
    })
    .get()
    .filter(Boolean);

  return {
    data: listings,
    hasMore: $(".pagination li:last-child:not(.disabled)").get().length > 0,
  };
};
