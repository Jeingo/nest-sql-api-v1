import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class PasswordRecoveryCodeIsCorrectConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async validate(recoveryCode: string) {
    const user = await this.usersRepository.getByUUIDCode(recoveryCode);
    if (!user) {
      throw new BadRequestException(['recoveryCode code is wrong']);
    }
    if (user.passwordRecoveryIsConfirmed) {
      throw new BadRequestException([
        'recoveryCode Password is already changed'
      ]);
    }
    if (user.passwordRecoveryExpirationDate < new Date()) {
      throw new BadRequestException(['recoveryCode code is expired']);
    }
    return true;
  }
}

export function PasswordRecoveryCodeIsCorrect(
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: PasswordRecoveryCodeIsCorrectConstraint
    });
  };
}
