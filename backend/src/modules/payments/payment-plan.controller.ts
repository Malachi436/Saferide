import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { PaymentPlanService } from './payment-plan.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentPlanController {
  constructor(private readonly paymentPlanService: PaymentPlanService) {}

  @Get('company/:companyId')
  @Roles('COMPANY_ADMIN', 'PLATFORM_ADMIN')
  async getCompanyPaymentPlans(@Param('companyId') companyId: string) {
    return this.paymentPlanService.getPaymentPlans(companyId);
  }

  @Post('company/:companyId')
  @Roles('COMPANY_ADMIN')
  async createPaymentPlan(
    @Param('companyId') companyId: string,
    @Body() createPaymentPlanDto: any
  ) {
    return this.paymentPlanService.createPaymentPlan(companyId, createPaymentPlanDto);
  }

  @Put(':id')
  @Roles('COMPANY_ADMIN')
  async updatePaymentPlan(
    @Param('id') id: string,
    @Body() updatePaymentPlanDto: any
  ) {
    return this.paymentPlanService.updatePaymentPlan(id, updatePaymentPlanDto);
  }

  @Delete(':id')
  @Roles('COMPANY_ADMIN')
  async deletePaymentPlan(@Param('id') id: string) {
    return this.paymentPlanService.deletePaymentPlan(id);
  }
}
