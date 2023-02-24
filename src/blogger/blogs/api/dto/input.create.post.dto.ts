import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../../../helper/validation-decorators/to.trim.decorator';

export class InputCreatePostInBlogsDto {
  @MaxLength(30)
  @IsString()
  @IsNotEmpty()
  @Trim()
  title: string;

  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  @Trim()
  shortDescription: string;

  @MaxLength(1000)
  @IsString()
  @IsNotEmpty()
  @Trim()
  content: string;
}
