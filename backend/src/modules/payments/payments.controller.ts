import { Controller, Post, Body, Get, Param, Headers, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';

class CreatePaymentIntentDto {
  parentId: string;
  amount: number;
  currency: string;
}

@Controller('payments')
@UseGuards(RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @Roles('PARENT')
  async createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(
      createPaymentIntentDto.parentId,
      createPaymentIntentDto.amount,
      createPaymentIntentDto.currency
    );
  }

  @Post('webhook')
  async processWebhook(
    @Headers('x-hubtle-signature') signature: string,
    @Body() payload: any
  ) {
    await this.paymentsService.processWebhook(signature, payload);
    return { received: true };
  }

  @Get('history/:parentId')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'PARENT')
  async getPaymentHistory(@Param('parentId') parentId: string) {
    return this.paymentsService.getPaymentHistory(parentId);
  }

  @Get(':id')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'PARENT')
  async getPaymentById(@Param('id') id: string) {
    return this.paymentsService.getPaymentById(id);
  }
}