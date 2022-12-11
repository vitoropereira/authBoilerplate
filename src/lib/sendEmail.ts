import nodemailer from "nodemailer";

interface SendEmailProps {
  from: string;
  to: string;
  subject: string;
  text: string;
}

const transporterConfiguration = {
  host: process.env.EMAIL_SMTP_HOST,
  port: process.env.EMAIL_SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(transporterConfiguration);

async function send({ from, to, subject, text }: SendEmailProps) {
  const mailOptions = {
    from: from,
    to: to,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    const errorObject = new ServiceError({
      message: error.message,
      action: "Verifique se o serviço de emails está disponível.",
      stack: error.stack,
      context: mailOptions,
      errorLocationCode: "INFRA:EMAIl:SEND",
    });
    logger.error(errorObject);
    throw errorObject;
  }
}

export default Object.freeze({
  send,
});
