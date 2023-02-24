import { Catch, HttpException, HttpStatus } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter {
  catch(exception, host) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    let result = undefined;

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        const messageAndField = exception.response.message.map(this.getError);
        result = { errorsMessages: messageAndField };
    }

    response.status(status).json(result);
  }
  private getError(errorString: string) {
    const errorStringArray = errorString.split(' ');
    const field = errorStringArray.shift();
    const message = errorStringArray.join(' ');

    return {
      message: message,
      field: field
    };
  }
}
