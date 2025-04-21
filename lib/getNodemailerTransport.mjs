import nodemailer from "nodemailer";

export const getNodemailerTransport = () => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
    options: {
      from: process.env.NODEMAILER_FROM_ADDRESS,
      to: process.env.NODEMAILER_TO_ADDRESS,
    },
  });

  return transporter;
};
