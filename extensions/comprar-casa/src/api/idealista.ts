import { ApiFetcherOptions, Listing, PaginatedListings } from "./api.types";
import { load as loadHtml } from "cheerio";
import puppeteer from "puppeteer";

// this represents the area to search, draw it on the website map and copy the value
const shape =
  "%28%28_blqFpjeu%40cyBqGayGiR%7BcD%3Fem%40ixHzi%40_%7CE%7C%7ECqkIbpCwpBdtGj%7EFx_CnfE%60VhbE%7BHdkG%7BvCbyA%29%29";

export const fetchIdealistaListings = async (options?: ApiFetcherOptions): Promise<PaginatedListings> => {
  const { pagination, abortController } = options ?? {};
  const pageNumber = (pagination?.page ?? 0) + 1;

  const pBrowser = await puppeteer.launch({ headless: true });

  abortController?.signal.addEventListener("abort", () => {
    pBrowser.close();
  });

  const pPage = await pBrowser.newPage();
  await pPage.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  );

  const pagePath = pageNumber > 1 ? `pagina-${pPage}` : "";
  await pPage.goto(
    `https://www.idealista.pt/areas/comprar-casas/com-preco-max_250000,preco-min_100000,t2,t3,t4-t5/${pagePath}?ordem=atualizado-desc&shape=${shape}`,
  );
  const content = await pPage.content();
  await pBrowser.close();

  const $ = loadHtml(content);

  const listings = $("article.item")
    .map((_, element): Listing | undefined => {
      const $$ = $(element);

      const id = $$.attr("data-element-id");
      const heading = $$.find("[role=heading]");
      const url = heading.attr("href");

      if (!id || !url) return undefined;

      return {
        id,
        url: `https://www.idealista.pt/${url}`,
        title: heading.text().trim(),
        price: $$.find(".item-price").text().trim(),
        image: $$.find(".item-gallery img").attr("src"),
        type: $$.find(".item-detail-char > .item-detail:first-child").text().trim(),
      };
    })
    .get()
    .filter(Boolean);

  return {
    data: listings,
    hasMore: $(".pagination li.next").get().length > 0,
  };
};
