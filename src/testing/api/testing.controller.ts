import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TestingService } from '../application/testing.service';

@Controller('testing/all-data')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  async remove() {
    return this.testingService.removeAll();
  }
}
