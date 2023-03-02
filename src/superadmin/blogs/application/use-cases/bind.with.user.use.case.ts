import { CommandHandler } from '@nestjs/cqrs';
import { SqlDbId } from '../../../../global-types/global.types';
import { BadRequestException } from '@nestjs/common';
import { SqlUsersRepository } from '../../../../users/infrastructure/sql.users.repository';
import { SqlBlogsRepository } from '../../../../blogs/infrastructure/sql.blogs.repository';

export class BindWithUserCommand {
  constructor(public blogId: SqlDbId, public userId: SqlDbId) {}
}

@CommandHandler(BindWithUserCommand)
export class BindWithUserUseCase {
  constructor(
    private readonly sqlUsersRepository: SqlUsersRepository,
    private readonly sqlBlogsRepository: SqlBlogsRepository
  ) {}

  async execute(command: BindWithUserCommand): Promise<boolean> {
    const blogId = command.blogId;
    const userId = command.userId;
    const blog = await this.sqlBlogsRepository.getById(blogId);
    const user = await this.sqlUsersRepository.getById(userId);
    if (!blog || !user)
      throw new BadRequestException(['blogId is not correct']);
    if (blog.userId !== null)
      throw new BadRequestException(['blogId is not correct']);
    await this.sqlBlogsRepository.bindWithUser(blogId, userId);
    return true;
  }
}
