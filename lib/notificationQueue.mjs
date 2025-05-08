import Queue from "bull";
import { env } from "./env.mjs";
import { NOTIFICATION_QUEUE_KEY } from "./constants.mjs";
import nodemailer from "nodemailer";
import path from "node:path";
import fs from "node:fs";

const GMAIL_PASS = fs.readFileSync(
  path.resolve(process.cwd(), env.GMAIL_PASS_FILE),
  "utf8",
);

/**
 * @type {Queue.Queue<{ html: string, subject: string }>} notificationQueue
 */
export const notificationQueue = new Queue(
  NOTIFICATION_QUEUE_KEY,
  `redis://localhost:6379`,
);

notificationQueue.on("active", function (job) {
  console.error(`Job ${job.id} started at ${new Date().toLocaleString()}`);
});

notificationQueue.on("completed", (job) => {
  console.error(`Job ${job.id} completed at ${new Date().toLocaleString()}`);
});

notificationQueue.on("failed", (job, err) => {
  const attemptsMade = job.attemptsMade;
  const maxAttempts = job.opts.attempts ?? 1;
  const remainingAttempts = maxAttempts - attemptsMade;

  console.error(
    `Job ${job.id} failed at ${new Date().toLocaleString()}`,
    "Error:",
    err,
    `Remaining Attempts: ${remainingAttempts}`,
  );

  if (remainingAttempts === 0) {
    process.exit(1);
  }
});

notificationQueue.process((job) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: env.GMAIL_USER,
      pass: GMAIL_PASS,
    },
  });

  const { subject, html } = job.data;

  return transporter.sendMail({
    subject,
    html,
    from: env.NODEMAILER_FROM_ADDRESS,
    to: env.NODEMAILER_TO_ADDRESS,
  });
});
