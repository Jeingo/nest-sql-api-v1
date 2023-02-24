import { LikeStatus } from '../../../global-types/global.types';

export class OutputPostLikeDto {
  id: string;
  userId: string;
  postId: string;
  myStatus: LikeStatus;
  login: string;
  addedAt: string;
}
