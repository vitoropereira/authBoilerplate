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

export interface EmailRepository {
  send: (data: SendEmailProps) => Promise<void>;
}
