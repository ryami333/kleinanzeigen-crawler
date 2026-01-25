import jsdom from "jsdom";
import { kleinanzeigenUrlSchema } from "../src/helpers/kleinanzeigenUrlSchema.ts";
// { JSDOM } = jsdom;

export const searchLatestResults = async ({ query }: { query: string }) => {
  // Navigate the page to a URL.
  const result = await fetch(
    kleinanzeigenUrlSchema.safeParse(query).success
      ? query
      : `https://www.kleinanzeigen.de/s-berlin/${query}/k0l3331`,
  ).then((result) => {
    if (result.status !== 200) {
      throw new Error("Response not OK");
    }
    return result.text();
  });

  const dom = new jsdom.JSDOM(result);

  /**
   * The #saved-search-empty-result element contains a message like "Es wurden
   * leider keine Ergebnisse für ____". If we come across this, we should bail
   * out because the ads listed on the page will be suggestions, not actual
   * search matches.
   */
  if (dom.window.document.querySelector("#saved-search-empty-result")) {
    console.log(`No results for ${query}`);
    return [];
  }

  const resultsContainer =
    dom.window.document.querySelector("#srchrslt-adtable");

  // TODO: assert

  const adElements = Array.from(
    resultsContainer?.querySelectorAll("article.aditem") ?? [],
  ).filter((adElement) => {
    /**
     * Exclude "PRO" ads – ads which are "related" by category but aren't
     * necessarily matches. Sellers/companies pay for these to appear on the
     * results page.
     */
    return !adElement.querySelector(".badge-hint-pro-small-srp");
  });

  // TODO: assert

  const results = Array.from(adElements).map((adElement) => {
    /**
     * I have historically had problems with nested selectors like:
     * `querySelector(".foo h2 a")`
     */
    const linkElement = adElement
      .querySelector(".aditem-main--middle")
      ?.querySelector("h2")
      ?.querySelector("a");

    return {
      id: adElement.getAttribute("data-adid"),
      href: adElement.getAttribute("data-href"),
      /**
       * `.innerText` doesn't seem to work well with JSDOM. Use `.textContent`
       * wherever possible.
       */
      heading: linkElement?.textContent.trim(),
      description: adElement
        .querySelector(".aditem-main--middle p")
        ?.innerHTML.trim(),
      price: adElement
        .querySelector(".aditem-main--middle--price-shipping--price")
        ?.innerHTML.trim(),
      markup: adElement.outerHTML,
    };
  });

  return results;
};
