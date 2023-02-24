import { IsNotEmpty } from 'class-validator';

export class InputBanBlogDto {
  @IsNotEmpty()
  isBanned: true;
}
