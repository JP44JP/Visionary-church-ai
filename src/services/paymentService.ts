import Stripe from 'stripe';
import { EventRegistration, PaymentStatus } from '../types/events';

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  description: string;
  metadata: Record<string, string>;
  customerId?: string;
  paymentMethodId?: string;
}

export interface RefundDetails {
  paymentIntentId: string;
  amount?: number; // Partial refund amount, full refund if not provided
  reason?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
  amount?: number;
  status?: PaymentStatus;
}

export class PaymentService {
  private stripe: Stripe | null = null;

  constructor() {
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20',
      });
    }
  }

  // Create payment intent for event registration
  async createPaymentIntent(paymentDetails: PaymentDetails): Promise<PaymentIntent | null> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(paymentDetails.amount * 100), // Convert to cents
        currency: paymentDetails.currency.toLowerCase(),
        description: paymentDetails.description,
        metadata: paymentDetails.metadata,
        customer: paymentDetails.customerId,
        payment_method: paymentDetails.paymentMethodId,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return null;
    }
  }

  // Confirm payment
  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    if (!this.stripe) {
      return { success: false, error: 'Stripe not configured' };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: paymentIntent.status === 'succeeded',
        paymentIntentId,
        amount: paymentIntent.amount / 100, // Convert back to dollars
        status: this.mapStripeStatusToPaymentStatus(paymentIntent.status),
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return { success: false, error: 'Failed to confirm payment' };
    }
  }

  // Process refund
  async processRefund(refundDetails: RefundDetails): Promise<PaymentResult> {
    if (!this.stripe) {
      return { success: false, error: 'Stripe not configured' };
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: refundDetails.paymentIntentId,
        amount: refundDetails.amount ? Math.round(refundDetails.amount * 100) : undefined,
        reason: refundDetails.reason as any,
      });

      return {
        success: refund.status === 'succeeded',
        amount: refund.amount / 100,
        status: refund.status === 'succeeded' ? 'refunded' : 'pending',
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      return { success: false, error: 'Failed to process refund' };
    }
  }

  // Create customer for recurring payments or future use
  async createCustomer(email: string, name?: string, metadata?: Record<string, string>): Promise<string | null> {
    if (!this.stripe) {
      return null;
    }

    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata,
      });

      return customer.id;
    } catch (error) {
      console.error('Error creating customer:', error);
      return null;
    }
  }

  // Create setup intent for saving payment method
  async createSetupIntent(customerId: string): Promise<{ clientSecret: string } | null> {
    if (!this.stripe) {
      return null;
    }

    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: setupIntent.client_secret!,
      };
    } catch (error) {
      console.error('Error creating setup intent:', error);
      return null;
    }
  }

  // Get customer payment methods
  async getCustomerPaymentMethods(customerId: string): Promise<any[]> {
    if (!this.stripe) {
      return [];
    }

    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('Error retrieving payment methods:', error);
      return [];
    }
  }

  // Calculate processing fees
  calculateProcessingFee(amount: number, paymentMethod: 'card' | 'ach' = 'card'): number {
    // Stripe fee calculation (as of 2024)
    if (paymentMethod === 'card') {
      return Math.round((amount * 0.029 + 0.30) * 100) / 100; // 2.9% + $0.30
    } else {
      return Math.round((amount * 0.008 + 0.05) * 100) / 100; // 0.8% + $0.05 for ACH
    }
  }

  // Generate donation receipt data
  generateReceiptData(registration: EventRegistration, eventTitle: string, churchName: string) {
    return {
      receiptNumber: `REC-${registration.id.slice(-8).toUpperCase()}`,
      date: registration.created_at,
      amount: registration.payment_amount || 0,
      eventTitle,
      churchName,
      donorName: 'Event Attendee', // This would come from user/visitor data
      taxDeductible: registration.payment_amount ? registration.payment_amount > 0 : false,
    };
  }

  // Handle webhook events from Stripe
  async handleWebhookEvent(payload: string, signature: string, endpointSecret: string): Promise<boolean> {
    if (!this.stripe) {
      return false;
    }

    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'charge.dispute.created':
          await this.handleDispute(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return true;
    } catch (error) {
      console.error('Webhook error:', error);
      return false;
    }
  }

  // Private helper methods
  private async handlePaymentSuccess(paymentIntent: any): Promise<void> {
    // Update registration payment status in database
    console.log(`Payment succeeded: ${paymentIntent.id}`);
    
    // Here you would update the event registration with successful payment
    // const registrationId = paymentIntent.metadata.registrationId;
    // await this.updateRegistrationPaymentStatus(registrationId, 'completed');
  }

  private async handlePaymentFailed(paymentIntent: any): Promise<void> {
    console.log(`Payment failed: ${paymentIntent.id}`);
    
    // Here you would update the event registration with failed payment
    // const registrationId = paymentIntent.metadata.registrationId;
    // await this.updateRegistrationPaymentStatus(registrationId, 'failed');
  }

  private async handleDispute(charge: any): Promise<void> {
    console.log(`Dispute created for charge: ${charge.id}`);
    
    // Handle dispute notification and processes
  }

  private mapStripeStatusToPaymentStatus(stripeStatus: string): PaymentStatus {
    switch (stripeStatus) {
      case 'succeeded':
        return 'completed';
      case 'processing':
        return 'pending';
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return 'pending';
      case 'canceled':
        return 'failed';
      default:
        return 'pending';
    }
  }

  // Subscription management for recurring donations
  async createSubscription(
    customerId: string,
    priceId: string,
    metadata?: Record<string, string>
  ): Promise<string | null> {
    if (!this.stripe) {
      return null;
    }

    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      return subscription.id;
    } catch (error) {
      console.error('Error creating subscription:', error);
      return null;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    if (!this.stripe) {
      return false;
    }

    try {
      await this.stripe.subscriptions.cancel(subscriptionId);
      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }
  }

  // Create price for event or donation
  async createPrice(
    amount: number,
    currency: string,
    description: string,
    recurring?: { interval: 'month' | 'year' }
  ): Promise<string | null> {
    if (!this.stripe) {
      return null;
    }

    try {
      const price = await this.stripe.prices.create({
        unit_amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        product_data: {
          name: description,
        },
        ...(recurring && { recurring }),
      });

      return price.id;
    } catch (error) {
      console.error('Error creating price:', error);
      return null;
    }
  }
}