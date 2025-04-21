import nodemailer from "nodemailer";

/**
 * @param {{ html: string, subject: string }} params
 */
export const sendNotification = ({ html, subject }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  return transporter.sendMail({
    subject,
    html,
    from: process.env.NODEMAILER_FROM_ADDRESS,
    to: process.env.NODEMAILER_TO_ADDRESS,
  });
};
