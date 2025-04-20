import nodemailer from "nodemailer";
import { createClient } from "redis";

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
