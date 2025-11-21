import jsdom from "jsdom";
// { JSDOM } = jsdom;

/**
 * @param {{ query: string }} params
 */
export const searchLatestResults = async ({ query }) => {
  // Navigate the page to a URL.
  const result = await fetch(
    `https://www.kleinanzeigen.de/s-berlin/${query}/k0l3331`,
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

  const adElements = resultsContainer?.querySelectorAll("article.aditem") ?? [];

  // TODO: assert

  const results = Array.from(adElements).map((adElement) => {
    console.log("Heading options:");

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
    };
  });

  return results;
};
