import "dotenv/config"; // Only needed for local dev.
import { crawlerQueue } from "./crawlerQueue.ts";
import { notificationQueue } from "./notificationQueue.ts";
import nodemailer from "nodemailer";
import { processJob } from "./processJob.ts";
import fs from "node:fs";
import path from "node:path";
import { env } from "./worker-env.ts";

/**
 * -----------------------------------------------------------------------------
 * NOTIFICATION QUEUE.
 * -----------------------------------------------------------------------------
 */
{
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
        pass: fs.readFileSync(
          path.resolve(process.cwd(), env.GMAIL_PASS_FILE),
          "utf8",
        ),
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
}

/**
 * -----------------------------------------------------------------------------
 * CRAWLER QUEUE.
 * -----------------------------------------------------------------------------
 */
{
  crawlerQueue.on("active", function (job) {
    console.error(`Job ${job.id} started at ${new Date().toLocaleString()}`);
  });

  crawlerQueue.on("completed", (job) => {
    console.error(`Job ${job.id} completed at ${new Date().toLocaleString()}`);
  });

  crawlerQueue.on("failed", (job, err) => {
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

  crawlerQueue.process(processJob);
}

notificationQueue.add({
  subject: "Crawler is live",
  html: `<p>Crawler started at ${new Date().toLocaleString()}</p>`,
});

/**
 * Start by setting a baseline so that we don't get emailed about all of the
 * _existing_ results.
 */
crawlerQueue.add({ sendNotifications: false });

crawlerQueue.add(
  { sendNotifications: true },
  {
    repeat: { cron: "*/5 * * * *" /* Every 5 minutes */ },
  },
);
