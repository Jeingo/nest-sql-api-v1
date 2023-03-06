import { PipeTransform, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CheckId implements PipeTransform {
  transform(id: string): string {
    if (Number.isNaN(+id)) throw new NotFoundException();

    return id;
  }
}
