import { LikeStatus } from '../../../global-types/global.types';
import { NewestLikesType } from '../types/query.posts.type';

export class OutputPostDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: Array<NewestLikesType>;
  };
}
