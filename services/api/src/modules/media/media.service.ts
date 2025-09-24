import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class MediaService {
  private readonly s3: S3Client;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT ?? 'http://localhost:9000';
    const accessKeyId = process.env.S3_ACCESS_KEY ?? 'minio';
    const secretAccessKey = process.env.S3_SECRET_KEY ?? 'minio12345';
    this.s3 = new S3Client({
      forcePathStyle: true,
      endpoint,
      region: 'us-east-1',
      credentials: { accessKeyId, secretAccessKey }
    });
  }

  async getSignedUploadUrl(key: string, contentType: string): Promise<string> {
    const bucket = process.env.S3_BUCKET ?? 'glocal-media';
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
    return getSignedUrl(this.s3, command, { expiresIn: 300 });
  }
}



