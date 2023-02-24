import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Trim } from '../../../../helper/validation-decorators/to.trim.decorator';

export class InputBanUserDto {
  @IsNotEmpty()
  isBanned: boolean;

  @MinLength(20)
  @IsString()
  @IsNotEmpty()
  @Trim()
  banReason: string;
}
