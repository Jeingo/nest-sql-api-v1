import { LikeStatus } from '../../../global-types/global.types';
import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../helper/validation-decorators/to.trim.decorator';
import { IsLike } from '../../../helper/validation-decorators/is.like.decorator';

export class InputUpdatePostLikeDto {
  @IsLike()
  @IsString()
  @IsNotEmpty()
  @Trim()
  likeStatus: LikeStatus;
}
