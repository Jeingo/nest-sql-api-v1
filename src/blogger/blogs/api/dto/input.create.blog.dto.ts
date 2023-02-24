import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { Trim } from '../../../../helper/validation-decorators/to.trim.decorator';

export class InputCreateBlogDto {
  @MaxLength(15)
  @IsString()
  @IsNotEmpty()
  @Trim()
  name: string;

  @MaxLength(500)
  @IsString()
  @IsNotEmpty()
  @Trim()
  description: string;

  @IsUrl()
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  @Trim()
  websiteUrl: string;
}
