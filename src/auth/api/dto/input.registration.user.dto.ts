import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches
} from 'class-validator';
import { Trim } from '../../../helper/validation-decorators/to.trim.decorator';
import { LoginExist } from '../../../helper/validation-decorators/login.exist.decorator';
import { EmailNotExist } from '../../../helper/validation-decorators/email.not.exist.decorator';

export class InputRegistrationUserDto {
  @LoginExist()
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @Length(3, 10)
  @IsString()
  @IsNotEmpty()
  @Trim()
  login: string;

  @Length(6, 20)
  @IsString()
  @IsNotEmpty()
  @Trim()
  password: string;

  @EmailNotExist()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Trim()
  email: string;
}
