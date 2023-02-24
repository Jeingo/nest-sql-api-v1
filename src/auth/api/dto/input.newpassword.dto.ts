import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../../helper/validation-decorators/to.trim.decorator';
import { PasswordRecoveryCodeIsCorrect } from '../../../helper/validation-decorators/password.recover.code.is.correct.decorator';

export class InputNewPasswordDto {
  @Length(6, 20)
  @IsString()
  @IsNotEmpty()
  @Trim()
  newPassword: string;

  @PasswordRecoveryCodeIsCorrect()
  @IsString()
  @IsNotEmpty()
  @Trim()
  recoveryCode: string;
}
