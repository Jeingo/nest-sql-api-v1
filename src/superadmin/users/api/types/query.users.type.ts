import { Direction } from '../../../../global-types/global.types';

export type QueryUsers = {
  banStatus: BanStatus;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  sortBy: string;
  sortDirection: Direction;
  pageNumber: string;
  pageSize: string;
};

export enum BanStatus {
  all = 'all',
  banned = 'banned',
  notBanned = 'notBanned'
}
