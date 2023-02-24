import { Direction } from '../../../../global-types/global.types';

export type QueryBannedUsers = {
  searchLoginTerm?: string;
  sortBy: string;
  sortDirection: Direction;
  pageNumber: string;
  pageSize: string;
};
