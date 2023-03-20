import { CommandHandler } from '@nestjs/cqrs';
import { SqlDbId } from '../../../global-types/global.types';
import { QuizRepository } from '../../infrastructure/quiz.repository';
import { InputCreateQuizDto } from '../../api/dto/input.create.quiz.dto';

export class CreateQuizCommand {
  constructor(public createQuizDto: InputCreateQuizDto) {}
}

@CommandHandler(CreateQuizCommand)
export class CreateQuizUseCase {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(command: CreateQuizCommand): Promise<SqlDbId> {
    const { body, correctAnswers } = command.createQuizDto;
    const quiz = this.quizRepository.create(body, correctAnswers);
    await this.quizRepository.save(quiz);
    return quiz.id.toString();
  }
}
