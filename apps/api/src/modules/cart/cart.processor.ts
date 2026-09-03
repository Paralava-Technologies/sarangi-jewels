import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../mail/mail.service';

@Processor('email-queue')
export class CartProcessor extends WorkerHost {
  private readonly logger = new Logger(CartProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<{ email: string; cartUrl: string }>) {
    if (job.name === 'abandoned-cart') {
      this.logger.log(`Processing abandoned-cart job ${job.id} for ${job.data.email}`);
      try {
        await this.mailService.sendAbandonedCartEmail(job.data.email, job.data.cartUrl);
        this.logger.log(`Successfully processed abandoned-cart job ${job.id}`);
      } catch (error) {
        this.logger.error(`Failed to process abandoned-cart job ${job.id}:`, error);
        throw error;
      }
    }
  }
}
