import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DOCUMENT_GENERATION_QUEUE, DocumentGenerationJob } from './constants';
import { OutputFormat } from '@prisma/client';

@Injectable()
export class DocumentGenerationQueueService {
  constructor(
    @InjectQueue(DOCUMENT_GENERATION_QUEUE) private generationQueue: Queue,
  ) {}

  async enqueuePreview(templateId: string, versionId: string, caseId: string, documentId: string, outputFormat: OutputFormat = OutputFormat.DOCX) {
    await this.generationQueue.add(
      DocumentGenerationJob.PREVIEW,
      {
        templateId,
        versionId,
        caseId,
        documentId,
        outputFormat,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
      },
    );
  }

  async enqueueFinal(templateId: string, versionId: string, caseId: string, documentId: string, outputFormat: OutputFormat = OutputFormat.DOCX) {
    await this.generationQueue.add(
      DocumentGenerationJob.FINAL,
      {
        templateId,
        versionId,
        caseId,
        documentId,
        outputFormat,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
      },
    );
  }
}
