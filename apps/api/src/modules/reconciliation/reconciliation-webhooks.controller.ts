import { Controller, Post, Body, Param, BadRequestException, Logger } from '@nestjs/common';
import { ReconciliationService } from './reconciliation.service';

@Controller('webhooks/reconciliation')
export class ReconciliationWebhooksController {
  private readonly logger = new Logger(ReconciliationWebhooksController.name);

  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Post('delhivery')
  async handleDelhiveryWebhook(@Body() payload: any) {
    this.logger.log(`Received Delhivery webhook: ${JSON.stringify(payload)}`);
    
    // Delhivery typical payload: { waybill: "AWB...", remittance_amount: 1500, utr_number: "..." }
    const orderNumber = payload.waybill || payload.order_number;
    const amountStr = payload.remittance_amount;
    const reference = payload.utr_number || 'N/A';

    if (!orderNumber || !amountStr) {
      throw new BadRequestException('Invalid payload: missing waybill or remittance_amount');
    }

    const settledAmountCents = Math.round(parseFloat(amountStr) * 100);
    const result = await this.reconciliationService.processSingleSettlement(orderNumber, settledAmountCents, 'Delhivery', reference);
    
    return { success: true, result };
  }

  @Post('bluedart')
  async handleBlueDartWebhook(@Body() payload: any) {
    this.logger.log(`Received BlueDart webhook: ${JSON.stringify(payload)}`);
    
    // BlueDart typical payload: { AWBNo: "...", CODAmountCollected: 1500, ChequeUTRNo: "..." }
    const orderNumber = payload.AWBNo || payload.RefNo;
    const amountStr = payload.CODAmountCollected;
    const reference = payload.ChequeUTRNo || 'N/A';

    if (!orderNumber || !amountStr) {
      throw new BadRequestException('Invalid payload: missing AWBNo or CODAmountCollected');
    }

    const settledAmountCents = Math.round(parseFloat(amountStr) * 100);
    const result = await this.reconciliationService.processSingleSettlement(orderNumber, settledAmountCents, 'BlueDart', reference);
    
    return { success: true, result };
  }

  @Post('porter')
  async handlePorterWebhook(@Body() payload: any) {
    this.logger.log(`Received Porter webhook: ${JSON.stringify(payload)}`);
    
    // Porter typical payload: { crn: "...", collected_amount: 1500, transaction_ref: "..." }
    const orderNumber = payload.crn || payload.client_order_id;
    const amountStr = payload.collected_amount;
    const reference = payload.transaction_ref || 'N/A';

    if (!orderNumber || !amountStr) {
      throw new BadRequestException('Invalid payload: missing crn or collected_amount');
    }

    const settledAmountCents = Math.round(parseFloat(amountStr) * 100);
    const result = await this.reconciliationService.processSingleSettlement(orderNumber, settledAmountCents, 'Porter', reference);
    
    return { success: true, result };
  }

  // Generic endpoint for future delivery partners
  @Post('generic/:partnerName')
  async handleGenericWebhook(@Param('partnerName') partnerName: string, @Body() payload: any) {
    this.logger.log(`Received Generic webhook for ${partnerName}: ${JSON.stringify(payload)}`);
    
    // Expecting standard unified payload: { orderId: "...", settledAmount: 1500, reference: "..." }
    const orderNumber = payload.orderId;
    const amountStr = payload.settledAmount;
    const reference = payload.reference || 'N/A';

    if (!orderNumber || !amountStr) {
      throw new BadRequestException('Invalid payload: missing orderId or settledAmount');
    }

    const settledAmountCents = Math.round(parseFloat(amountStr) * 100);
    const result = await this.reconciliationService.processSingleSettlement(orderNumber, settledAmountCents, partnerName, reference);
    
    return { success: true, result };
  }
}
