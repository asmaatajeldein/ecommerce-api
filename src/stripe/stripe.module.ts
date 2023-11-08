import { DynamicModule, Module, Provider } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, STRIPE_CONFIG_OPTIONS } from './constants';
import { StripeService } from './stripe.service';
import { ConfigService } from '@nestjs/config';

@Module({})
export class StripeModule {
  static registerAsync(
    stripeConfigOptions: Stripe.StripeConfig,
  ): DynamicModule {
    return {
      module: StripeModule,
      providers: [
        StripeService,
        ...this.createClientProviders(stripeConfigOptions),
      ],
      exports: [StripeService],
      global: true,
    };
  }

  private static createClientProviders(
    stripeConfigOptions: Stripe.StripeConfig,
  ): Provider[] {
    return [
      { provide: STRIPE_CONFIG_OPTIONS, useValue: stripeConfigOptions },
      {
        provide: STRIPE_SECRET_KEY,
        useFactory: async (configService: ConfigService) => {
          return await configService.getOrThrow('STRIPE_SECRET_KEY');
        },
        inject: [ConfigService],
      },
      ConfigService,
    ];
  }
}
