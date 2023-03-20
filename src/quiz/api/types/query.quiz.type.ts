import { Direction } from '../../../global-types/global.types';

export type QueryQuiz = {
  sortBy: string;
  sortDirection: Direction;
  pageNumber: string;
  pageSize: string;
};
