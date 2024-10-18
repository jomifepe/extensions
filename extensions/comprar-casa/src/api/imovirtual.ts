import { ApiFetcherOptions, Listing, PaginatedListings } from "./api.types";
import { load as loadHtml } from "cheerio";
import puppeteer from "puppeteer";

export const fetchImovirtualListings = async (options?: ApiFetcherOptions): Promise<PaginatedListings> => {
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

  await pPage.goto(
    `https://www.imovirtual.com/pt/resultados/comprar/apartamento/leiria/leiria?ownerTypeSingleSelect=ALL&roomsNumber=%5BTHREE%2CFOUR%2CSIX_OR_MORE%2CFIVE%5D&priceMin=100000&priceMax=250000&by=LATEST&direction=DESC&viewType=listing&mapBounds=39.92263356553851%3B-8.456632214411083%3B39.59721770890154%3B-9.080449623534877&page=${pageNumber}`,
  );
  const content = await pPage.content();
  await pBrowser.close();

  const $ = loadHtml(content);

  const listings = $("[data-cy='search.listing.organic'] [data-cy='listing-item']")
    .map((_, element): Listing | undefined => {
      const $$ = $(element);

      const link = $$.find("[data-cy='listing-item-link']");
      const url = link.attr("href");

      if (!url) return undefined;

      const images = $$.find("[data-testid='carousel-container'] img")
        .map((_, element) => $(element).attr("src"))
        .get();

      return {
        id: url,
        url: `https://www.imovirtual.com/${url}`,
        title: $$.find("[data-cy='listing-item-title']").text().trim(),
        price: $$.find("section>div:nth-child(2) span").text().trim(),
        image: images[0],
        images,
        type: $$.find("dd:first-of-type").text().trim(),
        location: $$.find("section>div:nth-child(2)>*:nth-child(3)>p").text().trim(),
      };
    })
    .get()
    .filter(Boolean);

  console.log({ listings });

  return {
    data: listings,
    hasMore: $("li[title='Go to next Page']:not([aria-disabled='true'])").get().length > 0,
  };
};
