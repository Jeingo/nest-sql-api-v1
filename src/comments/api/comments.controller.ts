import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards
} from '@nestjs/common';
import { CommentsQueryRepository } from '../infrastructure/comments.query.repository';
import { OutputCommentDto } from './dto/output.comment.dto';
import { GetUserGuard } from '../../auth/infrastructure/guards/get.user.guard';
import { InputCreateCommentDto } from './dto/input.create.comment.dto';
import { InputUpdateLikeDto } from './dto/input.update.like.dto';
import { CheckIdAndParseToDBId } from '../../helper/pipes/check.id.validator.pipe';
import { CurrentUser } from '../../helper/get-decorators/current.user.decorator';
import { CurrentUserType, DbId } from '../../global-types/global.types';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt.auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/use.cases/update.comment.use.case';
import { RemoveCommentCommand } from '../application/use.cases/remove.comment.use.case';
import { UpdateLikeStatusInCommentCommand } from '../application/use.cases/update.status.like.in.comment.use.case';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @UseGuards(GetUserGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(
    @Param('id', new CheckIdAndParseToDBId()) id: DbId,
    @CurrentUser() user: CurrentUserType
  ): Promise<OutputCommentDto> {
    return this.commentsQueryRepository.getById(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id', new CheckIdAndParseToDBId()) id: DbId,
    @Body() createCommentDto: InputCreateCommentDto,
    @CurrentUser() user: CurrentUserType
  ) {
    await this.commandBus.execute(
      new UpdateCommentCommand(id, createCommentDto, user)
    );
    return;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':commentId/like-status')
  async updateStatusLike(
    @Param('commentId', new CheckIdAndParseToDBId()) commentId: DbId,
    @Body() updateLikeDto: InputUpdateLikeDto,
    @CurrentUser() user: CurrentUserType
  ) {
    await this.commandBus.execute(
      new UpdateLikeStatusInCommentCommand(
        user,
        commentId,
        updateLikeDto.likeStatus
      )
    );
    return;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(
    @Param('id', new CheckIdAndParseToDBId()) id: DbId,
    @CurrentUser() user: CurrentUserType
  ) {
    await this.commandBus.execute(new RemoveCommentCommand(id, user));
    return;
  }
}
