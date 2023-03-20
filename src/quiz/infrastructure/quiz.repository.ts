import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SqlDbId } from '../../global-types/global.types';
import { Quiz } from '../domain/quiz.entity';

@Injectable()
export class QuizRepository {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>
  ) {}
  create(body: string, correctAnswers: string[]): Quiz {
    return Quiz.make(body, correctAnswers);
  }
  async save(quiz: Quiz): Promise<Quiz> {
    return await this.quizRepository.save(quiz);
  }
  async getById(id: SqlDbId): Promise<Quiz> {
    return this.quizRepository.findOneBy({ id: +id });
  }
  async delete(id: SqlDbId): Promise<boolean> {
    await this.quizRepository.delete(+id);
    return true;
  }
}
