import { IsArray, IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../../helper/validation-decorators/to.trim.decorator';

export class InputCreateQuizDto {
  @Length(10, 500)
  @IsString()
  @IsNotEmpty()
  @Trim()
  body: string;

  @IsNotEmpty()
  @IsArray()
  correctAnswers: string[];
}
