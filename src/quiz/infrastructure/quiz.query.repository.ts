import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedType, SqlDbId } from '../../global-types/global.types';
import { OutputQuizDto } from '../api/dto/output.quiz.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from '../domain/quiz.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuizQueryRepository {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>
  ) {}

  async getAll(): Promise<PaginatedType<OutputQuizDto>> {
    return {} as PaginatedType<OutputQuizDto>;
  }

  async getById(id: SqlDbId): Promise<OutputQuizDto> {
    const result = await this.quizRepository
      .createQueryBuilder()
      .where('id=:id', { id: +id })
      .getOne();
    if (!result) throw new NotFoundException();
    return this.getOutputQuizSql(result);
  }

  private getOutputQuizSql(quiz: Quiz): OutputQuizDto {
    return {
      id: quiz.id.toString(),
      body: quiz.body,
      correctAnswers: quiz.correctAnswers,
      published: quiz.published,
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString()
    };
  }
}
