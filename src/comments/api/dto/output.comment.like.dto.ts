import { LikeStatus } from '../../../global-types/global.types';

export class OutputCommentLikeDto {
  id: string;
  userId: string;
  commentId: string;
  myStatus: LikeStatus;
}
