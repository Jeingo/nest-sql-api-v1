import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { UserDocument } from '../../users/domain/entities/user.entity';

@Injectable()
export class EmailManager {
  constructor(private readonly emailService: EmailService) {}

  async sendRegistrationEmailConfirmation(user: UserDocument): Promise<void> {
    const emailForm = {
      from: '"Backend-09" <backend.jeingo@gmail.com>',
      to: user.email,
      subject: 'Registration confirmation',
      html: this.registrationConfirmationMessage(
        user.emailConfirmation.confirmationCode
      )
    };
    await this.emailService.sendEmail(emailForm);
  }
  async sendPasswordRecoveryEmailConfirmation(
    user: UserDocument
  ): Promise<void> {
    const emailForm = {
      from: '"Backend-09" <backend.jeingo@gmail.com>',
      to: user.email,
      subject: 'Password recovery confirmation',
      html: this.passwordRecoveryConfirmationMessage(
        user.passwordRecoveryConfirmation.passwordRecoveryCode
      )
    };
    await this.emailService.sendEmail(emailForm);
  }
  private registrationConfirmationMessage(code: string): string {
    return `
        <h1>Thank for your registration</h1>
            <p>To finish registration please follow the link below:
                 <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
            </p>
           `;
  }
  private passwordRecoveryConfirmationMessage(code: string): string {
    return `
        <h1>Password recovery</h1>
            <p>To finish password recovery please follow the link below:
                <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
            </p>
           `;
  }
}
