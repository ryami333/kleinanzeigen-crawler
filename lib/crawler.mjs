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
  url: "redis://redis:6379", // 'redis' is the hostname within Docker
});

client.on("error", (err) => console.error("Redis Client Error", err));

await client.connect();

// Example usage
await client.set("hello", "world");
const value = await client.get("hello");
console.log("Redis says:", value);

await client.quit();

// Launch the browser and open a new blank page
const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();

// Navigate the page to a URL.
await page.goto("https://developer.chrome.com/");

// Set screen size.
await page.setViewport({ width: 1080, height: 1024 });

// Type into search box.
await page.locator(".devsite-search-field").fill("automate beyond recorder");

// Wait and click on first result.
await page.locator(".devsite-result-item-link").click();

// Locate the full title with a unique string.
const textSelector = await page
  .locator("text/Customize and automate")
  .waitHandle();
const fullTitle = await textSelector?.evaluate((el) => el.textContent);

// Print the full title.
console.log('The title of this blog post is "%s".', fullTitle);

await browser.close();

// Add to set
await client.sAdd("processed-ids", listingId);

// Check if it has already been processed
const alreadyProcessed = await client.sIsMember("processed-ids", listingId);
