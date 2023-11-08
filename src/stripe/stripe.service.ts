import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { STRIPE_CONFIG_OPTIONS, STRIPE_SECRET_KEY } from './constants';

@Injectable()
export class StripeService {
  private stripeClient;

  constructor(
    private readonly configService: ConfigService,
    @Inject(STRIPE_SECRET_KEY) readonly stripeSecretKey: string,
    @Inject(STRIPE_CONFIG_OPTIONS)
    readonly stipeConfigOptions: Stripe.StripeConfig,
  ) {
    this.stripeClient = this.stripeClient
      ? this.stripeClient
      : new Stripe(stripeSecretKey, stipeConfigOptions);
  }

  async createCustomer(name: string, email: string) {
    return await this.stripeClient.customers.create({ name, email });
  }

  async deleteCustomer(customerId: string) {
    return await this.stripeClient.customers.del(customerId);
  }

  async chargeCard(
    amount: number,
    paymentMethodId: string,
    customerId: string,
    orderId: number,
    saveCardInfo?: boolean,
  ) {
    return await this.stripeClient.paymentIntents.create({
      amount,
      customer: customerId,
      payment_method: paymentMethodId,
      currency: this.configService.get('STRIPE_CURRENCY'),
      confirm: true,
      setup_future_usage: saveCardInfo ? 'on_session' : null,
      metadata: { order_id: orderId },
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
    });
  }

  async refundPayment(orderId: number) {
    const paymentIntent = await this.stripeClient.paymentIntents.search({
      query: `metadata['order_id']:'${orderId}'`,
    });

    return await this.stripeClient.refunds.create({
      payment_intent: paymentIntent.data[0].id,
    });
  }
}
