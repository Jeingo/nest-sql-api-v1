import { Types } from 'mongoose';

export type DbId = Types.ObjectId;

export type SqlDbId = string;

export enum Direction {
  ASC = 'ASC',
  DESC = 'DESC'
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
