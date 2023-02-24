import { Direction } from '../../../global-types/global.types';

export type QueryComments = {
  sortBy: string;
  sortDirection: Direction;
  pageNumber: string;
  pageSize: string;
};
