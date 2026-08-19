import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.initTransporter();
  }

  private async initTransporter() {
    if (process.env.MAIL_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT) || 587,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
    } else {
      // Create a test account for local development
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.log('Ethereal mock email transport created.');
    }
  }

  async sendOrderStatusUpdate(email: string, orderNumber: string, status: string, trackingNumber?: string, carrier?: string) {
    const subject = `Order ${orderNumber} Status Update: ${status}`;
    let html = `<h1>Your Order ${orderNumber}</h1>`;
    html += `<p>Your order status is now: <strong>${status}</strong></p>`;

    if (trackingNumber) {
      html += `<p>Tracking Number: <strong>${trackingNumber}</strong></p>`;
      if (carrier) {
        html += `<p>Carrier: <strong>${carrier}</strong></p>`;
      }
    }

    html += `<p>Thank you for shopping with Sarangi Jewels!</p>`;

    await this.sendMail(email, subject, html);
  }

  async sendOrderConfirmation(email: string, orderNumber: string, totalAmount: string) {
    const subject = `Order Confirmation: ${orderNumber}`;
    const html = `
      <h1>Thank you for your order!</h1>
      <p>Your order <strong>${orderNumber}</strong> has been successfully placed.</p>
      <p>Total amount: <strong>${totalAmount}</strong></p>
      <p>We will notify you once it ships.</p>
      <p>Thank you for shopping with Sarangi Jewels!</p>
    `;

    await this.sendMail(email, subject, html);
  }

  async sendWelcomeEmail(email: string, firstName: string | null) {
    const name = firstName ? firstName : 'Friend';
    const subject = `Welcome to Sarangi Jewels! We're thrilled to have you.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #8b5cf6;">Welcome to Sarangi Jewels, ${name}!</h1>
        <p>We are absolutely thrilled to welcome you to our application store. Your presence means the world to us!</p>
        <p>At Sarangi Jewels, we strive to bring you the best possible experience and the most carefully curated selection of items.</p>
        <p>Take your time to explore, and if you ever need anything, our support team is just a click away.</p>
        <br/>
        <p>Warmest regards,</p>
        <p><strong>The Sarangi Jewels Team</strong></p>
      </div>
    `;
    await this.sendMail(email, subject, html);
  }

  async sendNewsletterWelcome(email: string) {
    const subject = `Welcome to the Sarangi Jewels Journal`;
    const html = `
      <h1>Welcome to Sarangi Jewels!</h1>
      <p>Thank you for subscribing to our journal.</p>
      <p>You'll now receive first access to new drops, early entry to sales, and a short note from our studio.</p>
      <p>We are excited to have you with us.</p>
      <br>
      <p>Best regards,</p>
      <p><strong>The Sarangi Jewels Studio</strong></p>
    `;

    await this.sendMail(email, subject, html);
  }

  async sendTicketClosedEmail(email: string, ticketSubject: string) {
    const subject = `Support Ticket Closed: ${ticketSubject}`;
    const html = `
      <h1>Support Ticket Update</h1>
      <p>Your support ticket regarding <strong>"${ticketSubject}"</strong> has been marked as closed/resolved.</p>
      <p>If you need further assistance, please feel free to create a new ticket or reply to the existing conversation in your account dashboard.</p>
      <br>
      <p>Thank you,</p>
      <p><strong>The Sarangi Jewels Support Team</strong></p>
    `;

    await this.sendMail(email, subject, html);
  }

  async sendMarketingCampaign(emails: string[], subject: string, html: string) {
    if (!this.transporter && process.env.NODE_ENV !== 'test') {
      this.logger.warn('Transporter not initialized yet. Skipping campaign email.');
      return;
    }

    const from = process.env.MAIL_FROM || '"Sarangi Jewels Store" <noreply@sarangijewels.com>';

    // Send emails concurrently or in batches.
    // For a real production app, we would use a queue system (BullMQ) or a transactional email API (SendGrid, Postmark).
    // Here we use Promise.all for simplicity.
    await Promise.all(
      emails.map(async (email) => {
        try {
          if (process.env.NODE_ENV === 'test') {
            this.logger.log(`[Mock Campaign Email] To: ${email} | Subject: ${subject}`);
            return;
          }
          
          const info = await this.transporter!.sendMail({
            from,
            to: email,
            subject,
            html,
          });
          
          this.logger.log(`Campaign email sent to ${email}: ${info.messageId}`);
        } catch (error) {
          this.logger.error(`Failed to send campaign email to ${email}:`, error);
        }
      })
    );
  }

  async sendAbandonedCartEmail(email: string, cartUrl: string) {
    const subject = `You left something behind at Sarangi Jewels!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #8b5cf6;">Don't let it slip away...</h1>
        <p>We noticed you left some beautiful items in your cart. They are waiting for you!</p>
        <p>Click the link below to review your cart and complete your purchase:</p>
        <br/>
        <a href="${cartUrl}" style="background-color: #333; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Return to Cart</a>
        <br/><br/>
        <p>Warmest regards,</p>
        <p><strong>The Sarangi Jewels Team</strong></p>
      </div>
    `;
    await this.sendMail(email, subject, html);
  }

  private async sendMail(to: string, subject: string, html: string) {
    try {
      if (process.env.NODE_ENV === 'test') {
        this.logger.log(`[Mock Email] To: ${to} | Subject: ${subject}`);
        return;
      }
      
      if (!this.transporter) {
        this.logger.warn('Transporter not initialized yet. Skipping email.');
        return;
      }

      const info = await this.transporter.sendMail({
        from: process.env.MAIL_FROM || '"Sarangi Jewels Store" <noreply@sarangijewels.com>',
        to,
        subject,
        html,
      });
      
      this.logger.log(`Email sent: ${info.messageId}`);
      if (!process.env.MAIL_HOST) {
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
    }
  }
}
