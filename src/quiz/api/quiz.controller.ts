import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BasicAuthGuard } from '../../auth/infrastructure/guards/basic.auth.guard';
import { OutputQuizDto } from './dto/output.quiz.dto';
import { PaginatedType } from '../../global-types/global.types';
import { QueryQuiz } from './types/query.quiz.type';
import { QuizQueryRepository } from '../infrastructure/quiz.query.repository';
import { InputCreateQuizDto } from './dto/input.create.quiz.dto';
import { CreateQuizCommand } from '../application/use-cases/create.quiz.use.case';

@ApiTags('Quiz')
@UseGuards(BasicAuthGuard)
@Controller('/sa/quiz/questions')
export class QuizController {
  constructor(
    private readonly quizQueryRepository: QuizQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: QueryQuiz
  ): Promise<PaginatedType<OutputQuizDto>> {
    return await this.quizQueryRepository.getAll();
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createQuizDto: InputCreateQuizDto
  ): Promise<OutputQuizDto> {
    const createdQuizId = await this.commandBus.execute(
      new CreateQuizCommand(createQuizDto)
    );
    return await this.quizQueryRepository.getById(createdQuizId);
  }
}
