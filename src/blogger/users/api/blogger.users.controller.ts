import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt.auth.guard';
import { CheckId } from '../../../helper/pipes/check.id.validator.pipe';
import {
  CurrentUserType,
  PaginatedType,
  SqlDbId
} from '../../../global-types/global.types';
import { OutputBloggerUserDto } from './dto/output.blogger.user.dto';
import { BloggerUsersQueryRepository } from '../infrastructure/blogger.users.query.repository';
import { QueryBannedUsers } from './types/query.banned.users.type';
import { InputBloggerUserBanDto } from './dto/input.blogger.user.ban.dto';
import { BloggerBanUserCommand } from '../application/use-cases/blogger.ban.user.user.case';
import { CommandBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../helper/get-decorators/current.user.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Blogger Users')
@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    private readonly sqlBloggerUsersQueryRepository: BloggerUsersQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('blog/:blogId')
  async findBannedUsers(
    @Param('blogId', new CheckId()) blogId: SqlDbId,
    @Query() query: QueryBannedUsers,
    @CurrentUser() user: CurrentUserType
  ): Promise<PaginatedType<OutputBloggerUserDto>> {
    return await this.sqlBloggerUsersQueryRepository.getBannedUserByBlogId(
      blogId,
      query,
      user
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':userId/ban')
  async banUser(
    @Param('userId', new CheckId()) userId: SqlDbId,
    @Body() bloggerUserBanDto: InputBloggerUserBanDto,
    @CurrentUser() user: CurrentUserType
  ) {
    await this.commandBus.execute(
      new BloggerBanUserCommand(bloggerUserBanDto, userId, user)
    );
    return;
  }
}
