export type CommentsSqlType = {
  id: number;
  content: string;
  createdAt: Date;
  postId: number;
  userId: number;
};
