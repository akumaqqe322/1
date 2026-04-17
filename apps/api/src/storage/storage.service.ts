import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Env } from '../config/env.schema';
import { DomainException, ErrorCode } from '../common/exceptions/domain-exception';

export interface StorageFile {
  key: string;
  buffer: Buffer;
  contentType: string;
}

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(private configService: ConfigService<Env>) {
    this.s3Client = new S3Client({
      endpoint: this.configService.get('S3_ENDPOINT'),
      region: 'us-east-1', // Default for many S3-compatible storages
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY')!,
        secretAccessKey: this.configService.get('S3_SECRET_KEY')!,
      },
      forcePathStyle: true, // Required for Minio/LocalStack
    });
    this.bucket = this.configService.get('S3_BUCKET')!;
  }

  async upload(file: StorageFile): Promise<string> {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: file.key,
          Body: file.buffer,
          ContentType: file.contentType,
        }),
      );
      return file.key;
    } catch (e) {
      throw new DomainException(
        `File upload failed for key: ${file.key}`,
        ErrorCode.TEMPLATE_FILE_MISSING, // Reusing if related to templates
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getDownloadUrl(key: string, expiresId = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn: expiresId });
    } catch (e) {
      throw new DomainException(
        `Failed to generate download URL for key: ${key}`,
        ErrorCode.DOCUMENT_NOT_READY,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (e) {
      throw new DomainException(
        `Failed to delete file with key: ${key}`,
        ErrorCode.FORBIDDEN_ACTION,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
