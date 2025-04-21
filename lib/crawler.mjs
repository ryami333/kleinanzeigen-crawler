import nodemailer from "nodemailer";
import { createClient } from "redis";
import puppeteer from "puppeteer";

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS,
//   },
// });

// await transporter.sendMail({
//   from: process.env.NODEMAILER_FROM_ADDRESS,
//   to: process.env.NODEMAILER_TO_ADDRESS,
//   text: "Testing!",
// });

const client = createClient({
  url: "redis://localhost:6379", // 'redis' is the hostname within Docker
});

client.on("error", (err) => console.error("Redis Client Error", err));

await client.connect();

// Launch the browser and open a new blank page
const browser = await puppeteer.launch({
  headless: false,
  args: [
    // "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-setuid-sandbox",
    "--no-sandbox",
  ],
});
const page = await browser.newPage();

console.log("Created new page");

await page.setViewport({ width: 1080, height: 1024 });

console.log("Screen size set");

// Navigate the page to a URL.
await page.goto("https://www.kleinanzeigen.de/stadt/berlin/", {
  waitUntil: "load",
});

await await page.waitForSelector(`form`);

console.log("Navigated");

const formHandle = await page.$(`form`);

console.log("Found form");

// Type into search box.
const searchInput = await formHandle?.$("input[name=keywords]");

searchInput?.evaluate((el) => el.value === "ryzen");

console.log("Filled input");

// const buttonElement = await formHandle?.$("button");

await Promise.all([
  page.waitForNavigation(),
  formHandle?.evaluate((el) => el.submit()),
]);

console.log("Submitted form");

const resultsContainer = await page.$("#srchrslt-content");

console.log("Found results");

await page.waitForSelector(`article.aditem`);

const resultHandles = (await resultsContainer?.$$("article.aditem")) ?? [];

for (const resultHandle of resultHandles) {
  const { id, href, heading, description } = await resultHandle.evaluate(
    (resultElement) => {
      return {
        id: resultElement.getAttribute("data-adid"),
        href: resultElement.getAttribute("data-href"),
        heading: resultElement
          .querySelector(".aditem-main--middle")
          ?.querySelector("h2")?.innerText,
        description: resultElement
          .querySelector(".aditem-main--middle")
          ?.querySelector("p")?.innerText,
      };
    },
  );

  if (id) {
    const alreadyProcessed = await client.sIsMember("processed-ids", id);

    console.log({ id, description, heading, alreadyProcessed });

    await client.sAdd("processed-ids", id);
  }
}

await client.quit();
await browser.close();
