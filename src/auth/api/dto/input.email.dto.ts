import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../helper/validation-decorators/to.trim.decorator';
import { EmailExistAndDontConfirmed } from '../../../helper/validation-decorators/email.exist.and.dont.confirmed.decorator';

export class InputEmailDto {
  @EmailExistAndDontConfirmed()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Trim()
  email: string;
}
