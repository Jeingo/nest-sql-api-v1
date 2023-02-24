import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../helper/validation-decorators/to.trim.decorator';

export class InputLoginUserDto {
  @IsString()
  @IsNotEmpty()
  @Trim()
  loginOrEmail: string;

  @IsString()
  @IsNotEmpty()
  @Trim()
  password: string;
}
