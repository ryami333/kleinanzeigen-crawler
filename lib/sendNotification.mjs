import nodemailer from "nodemailer";
import path from "node:path";
import fs from "node:fs";
import { env } from "./env.mjs";

const GMAIL_PASS = fs.readFileSync(
  path.resolve(process.cwd(), env.GMAIL_PASS_FILE),
  "utf8",
);

/**
 * @param {{ html: string, subject: string }} params
 */
export const sendNotification = ({ html, subject }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: env.GMAIL_USER,
      pass: GMAIL_PASS,
    },
  });

  return transporter.sendMail({
    subject,
    html,
    from: env.NODEMAILER_FROM_ADDRESS,
    to: env.NODEMAILER_TO_ADDRESS,
  });
};
