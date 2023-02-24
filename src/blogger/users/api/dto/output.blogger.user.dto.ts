export class OutputBloggerUserDto {
  id: string;
  login: string;
  banInfo: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
  };
}
