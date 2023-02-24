import { Types } from 'mongoose';

export type DbId = Types.ObjectId;

export enum Direction {
  ASC = 'asc',
  DESC = 'desc'
}

export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  DisLike = 'Dislike'
}

export type LikesCounterType = {
  likesCount: number;
  dislikesCount: number;
};

export class PaginatedType<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
}

export type CurrentUserType = {
  userId: string;
  login: string;
};
