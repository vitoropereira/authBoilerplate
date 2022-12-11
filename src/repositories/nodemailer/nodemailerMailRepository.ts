import nodemailer from "nodemailer";
import { EmailRepository } from "../emailsRepository";
import { ServiceError } from "errors";

interface FromProps {
  name: string;
  address: string;
}

interface SendEmailProps {
  from: FromProps;
  to: string;
  subject: string;
  text: string;
}

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1080,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export class NodemailerMailRepository implements EmailRepository {
  async send({ from, to, subject, text }: SendEmailProps) {
    const mailOptions = {
      from: from,
      to: to,
      subject: subject,
      text: text,
    };

    transporter.verify(async (error, success) => {
      if (error) {
        throw new ServiceError({
          message: error.message,
          action: "Verifique se o serviço de emails está disponível.",
          stack: error.stack,
          context: "Send Email",
          errorLocationCode: "INFRA:EMAIl:SEND",
        });
      } else {
        await transporter.sendMail(mailOptions);
      }
    });
  }
}
