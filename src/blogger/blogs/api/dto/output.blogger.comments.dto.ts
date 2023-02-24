import { LikeStatus } from '../../../../global-types/global.types';

export class OutputBloggerCommentsDto {
  id: string;
  content: string;
  createdAt: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };
  postInfo: {
    id: string;
    title: string;
    blogId: string;
    blogName: string;
  };
}
