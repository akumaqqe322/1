import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { DomainException, ErrorCode } from '../common/exceptions/domain-exception';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async findAll() {
    return this.prisma.generatedDocument.findMany({
      include: {
        template: {
          select: {
            name: true,
            code: true,
          },
        },
        requestedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByCaseId(caseId: string) {
    return this.prisma.generatedDocument.findMany({
      where: { caseId },
      include: {
        template: {
          select: {
            name: true,
            code: true,
          },
        },
        requestedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    const doc = await this.prisma.generatedDocument.findUnique({
      where: { id },
      include: {
        template: true,
      },
    });

    if (!doc) {
      throw new DomainException(
        `Document with ID ${id} not found`,
        ErrorCode.DOCUMENT_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return doc;
  }

  async getDownloadUrl(id: string) {
    const doc = await this.findById(id);

    if (!doc.storagePath) {
      throw new DomainException(
        `Document ${id} is not ready for download (it may still be processing)`,
        ErrorCode.DOCUMENT_NOT_READY
      );
    }

    return this.storageService.getDownloadUrl(doc.storagePath);
  }
}
