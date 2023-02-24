import { Direction } from '../../../global-types/global.types';

export type QueryBlogs = {
  searchNameTerm?: string;
  sortBy: string;
  sortDirection: Direction;
  pageNumber: string;
  pageSize: string;
};
