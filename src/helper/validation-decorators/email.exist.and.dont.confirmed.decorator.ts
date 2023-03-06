import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users-repository.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class EmailExistAndDontConfirmedConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async validate(email: string) {
    const user = await this.usersRepository.getByLoginOrEmail(email);
    if (!user) {
      throw new BadRequestException(['email email is wrong']);
    }
    if (user.emailIsConfirmed) {
      throw new BadRequestException(['email account is already confirmed']);
    }
    return true;
  }
}

export function EmailExistAndDontConfirmed(
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailExistAndDontConfirmedConstraint
    });
  };
}
