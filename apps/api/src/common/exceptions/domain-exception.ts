import { HttpException, HttpStatus } from '@nestjs/common';

export enum ErrorCode {
  // Case Errors
  CASE_NOT_FOUND = 'CASE_NOT_FOUND',
  INCOMPLETE_CASE_DATA = 'INCOMPLETE_CASE_DATA',
  
  // Template Errors
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  VERSION_NOT_FOUND = 'VERSION_NOT_FOUND',
  NO_PUBLISHED_VERSION = 'NO_PUBLISHED_VERSION',
  TEMPLATE_FILE_MISSING = 'TEMPLATE_FILE_MISSING',
  TEMPLATE_NOT_VALIDATED = 'TEMPLATE_NOT_VALIDATED',
  
  // Generation Errors
  MISSING_REQUIRED_VARIABLES = 'MISSING_REQUIRED_VARIABLES',
  EXTRACTION_FAILURE = 'EXTRACTION_FAILURE',
  GENERATION_FAILED = 'GENERATION_FAILED',
  CONVERSION_FAILED = 'CONVERSION_FAILED',
  DOCUMENT_NOT_READY = 'DOCUMENT_NOT_READY',
  DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
  
  // Security/Auth Errors
  FORBIDDEN_ACTION = 'FORBIDDEN_ACTION',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export class DomainException extends HttpException {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly details?: any
  ) {
    super(
      {
        message,
        code,
        details,
        statusCode: status,
      },
      status,
    );
  }
}
