export type BlogsSqlType = {
  id: number;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
  isBanned: boolean;
  banDate: Date | null;
  userId: number;
};
