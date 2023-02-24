import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsBlogIdConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async validate(blogId: string) {
    const blog = await this.blogsRepository.getById(new Types.ObjectId(blogId));
    return !!blog;
  }
  defaultMessage() {
    return `blogId it isn't correct`;
  }
}

export function IsBlogId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBlogIdConstraint
    });
  };
}
