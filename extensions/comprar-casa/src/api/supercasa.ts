import { ApiFetcherOptions, Listing } from "./api.types";
import { load as loadHtml } from "cheerio";
import puppeteer from "puppeteer";
import { PaginatedData } from "../helpers/usePagination";

export const fetchSupercasaListings = async (options?: ApiFetcherOptions): Promise<PaginatedData<Listing>> => {
  const { pagination, abortController } = options ?? {};
  const pageNumber = pagination?.page ?? 1;

  const pBrowser = await puppeteer.launch({ headless: true });

  abortController?.signal.addEventListener("abort", () => {
    pBrowser.close();
  });

  const pPage = await pBrowser.newPage();
  await pPage.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
  );
  
  const pagePath = pageNumber > 1 ? `pagina-${pPage}` : "";
  const listingPageUrl = `https://supercasa.pt/comprar-casas/leiria/leiria-pousos-barreira-e-cortes/com-t2,t3,t4,preco-min-100000,preco-max-250000/${pagePath}?ordem=atualizado-desc`;

  await pPage.goto(listingPageUrl);
  const content = await pPage.content();
  await pBrowser.close();

  const $ = loadHtml(content);

  const listings = $(".list-properties .property")
    .map((_, element): Listing | undefined => {
      const $$ = $(element);

      const title = $$.find(".property-list-title");
      const url = title.find("a").attr("href");

      if (!url) return undefined;

      const image = $$.find(".swiper-wrapper").attr("style")?.split("url(")[1]?.split(")")[0];

      return {
        id: url,
        url: `https://supercasa.pt${url}`,
        title: title.text().trim(),
        price: $$.find(".property-price").text().trim(),
        image,
        type: $$.find(".property-features > span:first-child").text().trim(),
      };
    })
    .get()
    .filter(Boolean);

  return {
    data: listings,
    listingPageUrl,
    hasMore: $("li[title='Go to next Page']:not([aria-disabled='true'])").get().length > 0,
  };
};
