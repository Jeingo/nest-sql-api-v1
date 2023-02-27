import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { SqlUsersRepository } from '../../users/infrastructure/sql.users.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class EmailNotExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly sqlUsersRepository: SqlUsersRepository) {}

  async validate(email: string) {
    const user = await this.sqlUsersRepository.getByLoginOrEmail(email);
    return !user;
  }
  defaultMessage() {
    return `email is already exist`;
  }
}

export function EmailNotExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailNotExistConstraint
    });
  };
}
