import nodemailer from "nodemailer";
import { createClient } from "redis";
import { searchLatestResults } from "./searchLatestResults.mjs";

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

const results = await searchLatestResults({ keywords: "ryzen" });

/**
 * Start by setting a baseline so that we don't get emailed about all of the
 * _existing_ results.
 */
for (const result of results) {
  if (result.id) {
    await client.sAdd("processed-ids", result.id);
  }
}

console.log(results);

//     if (id) {
//       const alreadyProcessed = await client.sIsMember("processed-ids", id);

//       console.log({ id, description, heading, alreadyProcessed });

//       await client.sAdd("processed-ids", id);
//     }
//   })
// };
await client.quit();
