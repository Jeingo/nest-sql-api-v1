import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Quizzes')
export class Quiz extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 500 })
  body: string;

  @Column('simple-array')
  correctAnswers: string[];

  @Column('boolean')
  published: boolean;

  @Column('timestamptz')
  createdAt: Date;

  @Column('timestamptz')
  updatedAt: Date;

  update(body: string, correctAnswers: string[]): boolean {
    this.body = body;
    this.correctAnswers = correctAnswers;
    this.updatedAt = new Date();
    return true;
  }

  publish(published: boolean): boolean {
    this.published = published;
    return true;
  }

  static make(body: string, correctAnswers: string[]): Quiz {
    const newDate = new Date();
    const quiz = new Quiz();
    quiz.body = body;
    quiz.correctAnswers = correctAnswers;
    quiz.published = false;
    quiz.createdAt = newDate;
    quiz.updatedAt = newDate;

    return quiz;
  }
}
