import { Injectable } from '@nestjs/common';
import { EmailForm } from './types/email.type';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../../configuration/configuration';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService<IConfigType>) {}

  async sendEmail(form: EmailForm): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('EMAIL_LOGIN'),
        pass: this.configService.get('EMAIL_PASSWORD')
      }
    });

    await transporter.sendMail({
      from: form.from,
      to: form.to,
      subject: form.subject,
      html: form.html
    });
  }
}
