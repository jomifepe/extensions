import { ApiFetcherOptions, Listing } from "./api.types";
import { load as loadHtml } from "cheerio";
import puppeteer from "puppeteer";
import { PaginatedData } from "../helpers/usePagination";
import { Clipboard } from "@raycast/api";

export const fetchAngariaxListings = async (options?: ApiFetcherOptions): Promise<PaginatedData<Listing>> => {
  const { pagination, abortController } = options ?? {};
  const pageNumber = pagination?.page ?? 1;

  const pBrowser = await puppeteer.launch({ headless: true });

  abortController?.signal.addEventListener("abort", () => {
    pBrowser.close();
  });

  const pPage = await pBrowser.newPage();
  await pPage.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  );

  const listingPageUrl = `https://angariax.pt/imoveis/?pg=${pageNumber}&o=1&g=1&e=&pp=176&dd=10&cc=09&ff=&ml=&z=&nq=&p=100000-260000&a=&c=&es=&ct=00000001&or=30&idioma=pt&q=`;

  await pPage.goto(listingPageUrl);
  const content = await pPage.content();
  await pBrowser.close();

  const $ = loadHtml(content);

  const listings = $(".card-imovel")
    .map((_, element): Listing | undefined => {
      const $$ = $(element);

      Clipboard.copy($$.html() ?? '')
      
      const id = $$.attr("data-id");
      const url = $$.find(".card-imovel_link").attr("href");
      
      if (!id || !url) return undefined;
      const title = $$.find(".card-imovel_titulo > .titulo").text().trim();

      console.log({id, url, title})
      
      const images = $$.find(".swiper-slide img")
        .map((_, element) => $(element).attr("srcset")?.split(",")[0].split(" ")[0])
        .get();

      return {
        id,
        url: `https://angariax.pt${url}`,
        title: title,
        price: $$.find(".card-imovel_preco .preco_actual").text().trim(),
        image: images[1],
        images,
        type: $$.find(".card-imovel_caracteristicas .lbl_valor").first().text().trim(),
        location: $$.find(".subtitulo.card-imovel_localidade").text().trim(),
      };
    })
    .get()
    .filter(Boolean);

  return {
    data: listings,
    listingPageUrl,
    hasMore: $(".js-mudapagina.comp-main-button:not(.inactive)").get().length > 0,
  };
};
