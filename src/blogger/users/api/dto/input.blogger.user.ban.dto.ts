import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Trim } from '../../../../helper/validation-decorators/to.trim.decorator';

export class InputBloggerUserBanDto {
  @IsNotEmpty()
  isBanned: boolean;

  @MinLength(20)
  @IsString()
  @IsNotEmpty()
  @Trim()
  banReason: string;

  @IsString()
  @IsNotEmpty()
  @Trim()
  blogId: string;
}
