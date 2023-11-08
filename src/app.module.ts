import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { APP_GUARD } from '@nestjs/core';
import { AbilityGuard, AccessTokenGuard } from './common/guards';

import { PrismaModule } from './database/prisma.module';
import { StripeModule } from './stripe/stripe.module';
import { AbilityModule } from './ability/ability.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CartItemModule } from './modules/cart-item/cart-item.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { OrderModule } from './modules/order/order.module';
import { ProductModule } from './modules/product/product.module';
import { VariantModule } from './modules/variant/variant.module';
import { VariantDetailModule } from './modules/variant-detail/variant-detail.module';
import { CategoryModule } from './modules/category/category.module';
import { CategoryDetailModule } from './modules/category-detail/category-detail.module';
import { BrandModule } from './modules/brand/brand.module';
import { HistoryModule } from './modules/history/history.module';
import { VoucherModule } from './modules/voucher/voucher.module';
import { AddressModule } from './modules/address/address.module';
import { CountryModule } from './modules/country/country.module';
import { RegionModule } from './modules/region/region.module';
import { CityModule } from './modules/city/city.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    StripeModule.registerAsync({ apiVersion: '2023-10-16' }),
    PrismaModule,
    AbilityModule,
    AuthModule,
    UserModule,
    CartItemModule,
    WishlistModule,
    OrderModule,
    ProductModule,
    VariantModule,
    VariantDetailModule,
    CategoryModule,
    CategoryDetailModule,
    BrandModule,
    HistoryModule,
    VoucherModule,
    AddressModule,
    CountryModule,
    RegionModule,
    CityModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: AbilityGuard },
  ],
})
export class AppModule {}
