import puppeteer from "puppeteer";
import { PuppeteerBlocker } from "@ghostery/adblocker-puppeteer";
import { env } from "./env.mjs";

/**
 * @param {{ keywords: string }} params
 */
export const searchLatestResults = async ({ keywords }) => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: env.PUPPETEER_HEADLESS === "true",
    args: [
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-sandbox",
      ...(env.PUPPETEER_HEADLESS === "true" ? ["--disable-gpu"] : []),
    ].filter(Boolean),
  });

  // Auto-remove on close to avoid memory leaks
  browser.once("disconnected", () => browser.close());

  const page = await browser.newPage();

  await PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
    blocker.enableBlockingInPage(page);
  });

  console.log("Created new page");

  await page.setViewport({ width: 1080, height: 1024 });

  console.log("Screen size set");

  // Navigate the page to a URL.
  await page.goto(`https://www.kleinanzeigen.de/s-berlin/${keywords}/k0l3331`);

  console.log("Navigated");

  const resultsContainer = await page.$("#srchrslt-content");

  console.log("Found results");

  await page.waitForSelector(`article.aditem`);

  const resultHandles = (await resultsContainer?.$$("article.aditem")) ?? [];

  const results = await Promise.all(
    resultHandles.map(async (resultHandle) =>
      resultHandle.evaluate((resultElement) => {
        return {
          id: resultElement.getAttribute("data-adid"),
          href: resultElement.getAttribute("data-href"),
          heading: resultElement
            .querySelector(".aditem-main--middle")
            ?.querySelector("h2")?.innerText,
          description: resultElement
            .querySelector(".aditem-main--middle")
            ?.querySelector("p")?.innerText,
          price: resultElement
            .querySelector(".aditem-main--middle--price-shipping--price")
            ?.innerHTML.trim(),
        };
      }),
    ),
  );

  await browser.close();

  return results;
};
