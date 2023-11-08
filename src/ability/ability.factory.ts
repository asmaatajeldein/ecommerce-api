import { AbilityBuilder, PureAbility } from '@casl/ability';
import { PrismaQuery, Subjects, createPrismaAbility } from '@casl/prisma';
import { Injectable } from '@nestjs/common';
import {
  $Enums,
  Address,
  Brand,
  Category,
  City,
  Country,
  History,
  Order,
  OrderTransaction,
  Product,
  ProductCustomer,
  ProductVariant,
  Region,
  User,
  Voucher,
  Wishlist,
} from '@prisma/client';

export type AppActions = 'manage' | 'create' | 'read' | 'update' | 'delete';
export type AppSubjects =
  | 'all'
  | Subjects<{
      User: User;
      UserInfo: Omit<
        User,
        'customerId' | 'password' | 'createdAt' | 'hashedRt' | 'role'
      >;
      Address: Address;
      Brand: Brand;
      Category: Category;
      Product: Product;
      ProductVariant: ProductVariant;
      ProductCustomer: ProductCustomer;
      Country: Country;
      Region: Region;
      City: City;
      Voucher: Voucher;
      Wishlist: Wishlist;
      Order: Order;
      OrderTransaction: OrderTransaction;
      History: History;
    }>;

export type AppAbility = PureAbility<
  [AppActions, AppSubjects],
  PrismaQuery<AppSubjects>
>;

@Injectable()
export class AbilityFactory {
  defineAbilityFor(currentUser: User) {
    return createPrismaAbility(this.defineRulesFor(currentUser));
  }

  private defineRulesFor(currentUser: User) {
    const builder = new AbilityBuilder<AppAbility>(createPrismaAbility);

    switch (currentUser.role) {
      case $Enums.Role.CUSTOMER:
        this.defineCustomerRules(builder, currentUser);
        break;
      case $Enums.Role.SUPERADMIN:
        this.defineSuperAdminRules(builder, currentUser);
        break;
      case $Enums.Role.ADMIN:
        this.defineAdminRules(builder, currentUser);
        break;
    }

    return builder.rules;
  }

  private defineCustomerRules(
    { can }: AbilityBuilder<AppAbility>,
    currentUser: User,
  ) {
    can('manage', 'Address', { customerId: currentUser.customerId });
    can('manage', 'ProductCustomer', { customerId: currentUser.customerId });
    can('manage', 'Wishlist', { customerId: currentUser.customerId });
    can('manage', 'History', { customerId: currentUser.customerId });

    can('create', 'Order', { customerId: currentUser.customerId });
    can('read', 'Order', { customerId: currentUser.customerId });
    can('delete', 'Order', { customerId: currentUser.customerId });
    can('update', 'Order', ['addressId'], {
      customerId: currentUser.customerId,
    });
    can('update', 'Order', ['status'], { status: 'CANCELLED' });

    can('read', 'User', { id: currentUser.id });
    can('update', 'UserInfo', { id: currentUser.id });
    can('update', 'User', ['password'], { id: currentUser.id });
    can('delete', 'User', { id: currentUser.id });

    can('read', 'Brand');
    can('read', 'Category');
    can('read', 'Product');
    can('read', 'ProductVariant');
    can('read', 'Country');
    can('read', 'Region');
    can('read', 'City');
    can('read', 'Voucher');
  }

  private defineSuperAdminRules(
    builder: AbilityBuilder<AppAbility>,
    currentUser: User,
  ) {
    const { can } = builder;

    can('create', 'User', { role: { in: ['ADMIN', 'SUPERADMIN'] } });
    can('update', 'User', ['role']);
    can('delete', 'User');

    can('read', 'User');

    this.defineAdminRules(builder, currentUser);
  }

  private defineAdminRules(
    { can }: AbilityBuilder<AppAbility>,
    currentUser: User,
  ) {
    can('read', 'Address');

    can('manage', 'Brand');
    can('manage', 'Category');
    can('manage', 'Product');
    can('manage', 'ProductVariant');
    can('manage', 'Country');
    can('manage', 'Region');
    can('manage', 'City');
    can('manage', 'Voucher');

    can('update', 'User', ['password'], { id: currentUser.id });
    can('update', 'UserInfo', { id: currentUser.id });

    can('read', 'Order');
    can('update', 'Order', ['status'], { status: { not: 'CANCELLED' } });

    can('read', 'OrderTransaction');
  }
}
