import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(S3Service.name);
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET') || 'sarangi-media';
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'ap-south-1',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'products'): Promise<string> {
    const key = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        })
      );
      
      const cdnUrl = this.configService.get<string>('CDN_URL');
      if (cdnUrl) {
        return `${cdnUrl}/${key}`;
      }
      return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${error}`);
      throw new Error('Failed to upload media');
    }
  }
}
