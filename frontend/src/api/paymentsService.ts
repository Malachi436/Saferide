/**
 * Payments Service
 * Handles operations related to payments and billing
 */

import apiClient from './client';
import { Payment } from '../types/models';

export interface CreatePaymentIntentRequest {
  parentId: string;
  amount: number;
  currency: string;
}

class PaymentsService {
  /**
   * Create a payment intent for MoMo payment
   */
  async createPaymentIntent(paymentData: CreatePaymentIntentRequest): Promise<any> {
    try {
      const response = await apiClient.post('/payments/create-intent', paymentData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Process webhook callback from payment provider
   */
  async processWebhook(signature: string, payload: any): Promise<any> {
    try {
      const response = await apiClient.post('/payments/webhook', payload, {
        headers: {
          'x-hubtle-signature': signature,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to process webhook');
    }
  }

  /**
   * Get payment history for a parent
   */
  async getPaymentHistory(parentId: string): Promise<Payment[]> {
    try {
      const response = await apiClient.get<Payment[]>(`/payments/history/${parentId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch payment history');
    }
  }

  /**
   * Get a specific payment by ID
   */
  async getPaymentById(paymentId: string): Promise<Payment> {
    try {
      const response = await apiClient.get<Payment>(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch payment');
    }
  }
}

export default new PaymentsService();