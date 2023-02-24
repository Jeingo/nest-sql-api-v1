import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../helper/validation-decorators/to.trim.decorator';
import { EmailConfirmationCodeIsCorrect } from '../../../helper/validation-decorators/email.confirmation.code.is.correct.decorator';

export class InputConfirmationCodeDto {
  @EmailConfirmationCodeIsCorrect()
  @IsString()
  @IsNotEmpty()
  @Trim()
  code: string;
}
