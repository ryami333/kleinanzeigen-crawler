import jsdom from "jsdom";
// { JSDOM } = jsdom;

/**
 * @param {{ keywords: string }} params
 */
export const searchLatestResults = async ({ keywords }) => {
  // Navigate the page to a URL.
  const result = await fetch(
    `https://www.kleinanzeigen.de/s-berlin/${keywords}/k0l3331`,
  ).then((result) => {
    if (result.status !== 200) {
      throw new Error("Response not OK");
    }
    return result.text();
  });

  const dom = new jsdom.JSDOM(result);

  const resultsContainer =
    dom.window.document.querySelector("#srchrslt-content");

  // TODO: assert

  const adElements = resultsContainer?.querySelectorAll("article.aditem") ?? [];

  // TODO: assert

  const results = Array.from(adElements).map((adElement) => {
    const middleElement = adElement.querySelector(".aditem-main--middle");
    console.log(
      adElement.querySelector(".aditem-main--middle h2 a")?.innerHTML,
    );

    return {
      id: adElement.getAttribute("data-adid"),
      href: adElement.getAttribute("data-href"),
      /**
       * `.innerText` doesn't seem to work well with JSDOM
       */
      heading: adElement
        .querySelector(".aditem-main--middle h2 a")
        ?.innerHTML.trim(),
      description: adElement
        .querySelector(".aditem-main--middle p")
        ?.innerHTML.trim(),
      price: adElement
        .querySelector(".aditem-main--middle--price-shipping--price")
        ?.innerHTML.trim(),
    };
  });

  console.log(results);

  return results;
};
