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
  service: "smtp-relay.sendinblue.com",
  port: 587,
  auth: {
    user: "vop1234@hotmail.com",
    pass: "adfadsfadsfadsf",
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
