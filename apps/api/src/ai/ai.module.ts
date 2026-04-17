import { Module } from '@nestjs/common';
import { ExtractionService } from './extraction.service';
import { AIController } from './ai.controller';

@Module({
  controllers: [AIController],
  providers: [ExtractionService],
  exports: [ExtractionService],
})
export class AIModule {}
