import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Trim } from '../../../helper/validation-decorators/to.trim.decorator';
import { EmailConfirmationCodeIsCorrect } from '../../../helper/validation-decorators/email.confirmation.code.is.correct.decorator';

export class InputConfirmationCodeDto {
  @EmailConfirmationCodeIsCorrect()
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  @Trim()
  code: string;
}
