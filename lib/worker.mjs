import { GMAIL_PASS } from "./constants.mjs";
import { crawlerQueue } from "./crawlerQueue.mjs";
import { env } from "./env.mjs";
import { notificationQueue } from "./notificationQueue.mjs";
import nodemailer from "nodemailer";
import { processJob } from "./processJob.mjs";

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
