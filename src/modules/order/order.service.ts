import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { StripeService } from 'src/stripe/stripe.service';
import {
  CreateOrderRequestDto,
  RefundOrderRequestDto,
  UpdateOrderAddressRequestDto,
  UpdateOrderStatusRequestDto,
} from './dto';
import { AbilityFactory } from 'src/ability/ability.factory';
import { User } from '@prisma/client';
import { subject } from '@casl/ability';

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly stripeService: StripeService,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  async create(
    currentUser: User,
    customerId: number,
    request: CreateOrderRequestDto,
  ) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const orderToBeCreated = subject('Order', {
      customerId,
    });

    if (!ability.can('create', orderToBeCreated)) {
      throw new ForbiddenException(
        'Tried to create an unauthorized resource (Order)',
      );
    }

    const customer = await this.prismaService.customer.findUnique({
      where: { id: customerId },
      include: {
        cartItems: {
          select: { id: true, productVariant: true, quantity: true },
        },
      },
    });

    if (!customer.cartItems.length)
      throw new BadRequestException(
        "Cannot make an order because customer's cart is empty",
      );

    // validate addressId
    let orderAddress;
    if (request?.addressId) {
      orderAddress = await this.prismaService.address
        .findUnique({
          where: { id: request.addressId },
        })
        .catch((err) => {
          if (err instanceof PrismaClientKnownRequestError) {
            if (err.code == 'P2025') {
              throw new NotFoundException('Invalid addressId');
            }
          }
        });
    } else {
      orderAddress = await this.prismaService.address
        .findFirstOrThrow({
          where: { customerId, default: { equals: true } },
        })
        .catch((err) => {
          if (err instanceof PrismaClientKnownRequestError) {
            if (err.code == 'P2025') {
              throw new BadRequestException(
                "Provide an addressId in request as there's no default address for this customer",
              );
            }
          }
        });
    }

    // validate voucherId
    let orderVoucher;
    if (request?.voucherCode) {
      orderVoucher = await this.prismaService.voucher
        .findUnique({
          where: { code: request.voucherCode },
        })
        .catch((err) => {
          if (err instanceof PrismaClientKnownRequestError) {
            if (err.code == 'P2025') {
              throw new NotFoundException('Invalid voucherCode');
            }
          }
        });
    }

    const transaction = await this.prismaService.$transaction(async () => {
      const createdOrder = await this.prismaService.order.create({
        data: {
          customerId,
          addressId: orderAddress.id,
          voucherId: orderVoucher?.id ? orderVoucher.id : null,
          orderProduct: {
            createMany: {
              data: [
                ...customer.cartItems.map((item) => {
                  return {
                    productVariantId: item.productVariant.id,
                    quantity: item.quantity,
                    price: item.productVariant.price,
                  };
                }),
              ],
            },
          },
        },
        include: {
          orderProduct: {
            select: { productVariantId: true, price: true, quantity: true },
          },
        },
      });

      // calculate order amount
      let orderAmount = customer.cartItems.reduce((acc, cur) => {
        return acc + cur.quantity * cur.productVariant.price;
      }, 0);

      if (orderVoucher) {
        const discountedAmount =
          orderAmount * (orderVoucher.percentageDiscount / 100);
        if (discountedAmount > orderVoucher.upperLimit) {
          orderAmount = orderAmount - orderVoucher.upperLimit;
        } else {
          orderAmount = orderAmount - discountedAmount;
        }
      }

      let cardCharge;
      if (request?.paymentMethodId) {
        if (!request?.saveCardInfo) request.saveCardInfo = false;

        cardCharge = await this.stripeService.chargeCard(
          orderAmount,
          request.paymentMethodId,
          customer.stripeCustomerId,
          createdOrder.id,
          request.saveCardInfo,
        );
      }

      // create order transaction
      await this.prismaService.orderTransaction.create({
        data: {
          customerId,
          orderId: createdOrder.id,
          paymentMethod: request?.paymentMethodId ? 'CARD' : 'CASH',
          paymentState:
            cardCharge?.status === 'succeeded' ? 'SUCCEEDED' : 'PENDING',
          amount: orderAmount,
          type: 'CREDIT',
        },
      });

      // empty user's cart
      await this.prismaService.customer.update({
        where: { id: customerId },
        data: { cartItems: { deleteMany: {} } },
      });

      return createdOrder;
    });

    return transaction;
  }

  async getAll(currentUser: User, customerId: number) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const orderToBeRead = subject('Order', {
      customerId,
    });

    if (!ability.can('read', orderToBeRead)) {
      throw new ForbiddenException(
        'Tried to read an unauthorized resource (Order)',
      );
    }

    const orders = await this.prismaService.customer
      .findUniqueOrThrow({
        where: { id: customerId },
        select: { orders: true, id: false },
      })
      .catch((error) => {
        throw error;
      });

    return orders;
  }

  async getAllTransactions(customerId: number) {
    await this.prismaService.customer
      .findUniqueOrThrow({
        where: { id: customerId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Invalid customerId');
          }
        }
        throw error;
      });

    const ordersTransactions = await this.prismaService.orderTransaction
      .findMany({
        where: { customerId },
      })
      .catch((error) => {
        throw error;
      });

    return ordersTransactions;
  }

  async getOneById(currentUser: User, customerId: number, orderId: number) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const cartItemToBeRead = subject('Order', {
      customerId,
    });

    if (!ability.can('read', cartItemToBeRead)) {
      throw new ForbiddenException(
        'Tried to read an unauthorized resource (Order)',
      );
    }

    const order = await this.prismaService.order
      .findUniqueOrThrow({
        where: { id: orderId, customerId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Invalid orderId');
          }
        }
        throw error;
      });

    return order;
  }

  async getTransactionsById(customerId: number, orderId: number) {
    await this.prismaService.order
      .findUniqueOrThrow({
        where: { id: orderId, customerId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Invalid orderId');
          }
        }
        throw error;
      });

    const orderTransactions = await this.prismaService.orderTransaction
      .findMany({
        where: { id: customerId, orderId },
      })
      .catch((error) => {
        throw error;
      });

    return orderTransactions;
  }

  async updateAddress(
    currentUser: User,
    customerId: number,
    orderId: number,
    request: UpdateOrderAddressRequestDto,
  ) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const orderToBeUpdated = subject('Order', {
      customerId,
      addressId: 1,
    });

    if (!ability.can('update', orderToBeUpdated, 'addressId')) {
      throw new ForbiddenException(
        'Tried to update an unauthorized resource (Order)',
      );
    }

    const order = await this.prismaService.order
      .findUniqueOrThrow({
        where: { id: orderId, customerId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2003') {
            throw new BadRequestException('Invalid orderId');
          }
        }
        throw error;
      });

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot update the address of an order with ${order.status} status`,
      );
    }

    if (request?.addressId) {
      await this.prismaService.address
        .findUniqueOrThrow({
          where: { id: request.addressId, customerId },
        })
        .catch((error) => {
          if (error instanceof PrismaClientKnownRequestError) {
            if (error.code == 'P2025') {
              throw new NotFoundException('Invalid addressId');
            }
          }
          throw error;
        });
    }

    const updatedOrder = await this.prismaService.order.update({
      where: { id: orderId, customerId },
      data: { ...request },
    });

    return {
      message: 'Order address was updated successfully',
      order: updatedOrder,
    };
  }

  async updateStatus(
    currentUser: User,
    customerId: number,
    orderId: number,
    request: UpdateOrderStatusRequestDto,
  ) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const orderToBeUpdated = subject('Order', {
      status: request.status,
    });

    if (!ability.can('update', orderToBeUpdated, 'status')) {
      throw new ForbiddenException(
        'Tried to update an unauthorized resource (Order)',
      );
    }

    const order = await this.prismaService.order
      .findUniqueOrThrow({
        where: { id: orderId, customerId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025' || error.code == 'P2003') {
            throw new NotFoundException('Invalid orderId');
          }
        }
        throw error;
      });

    if (order.status == 'CANCELLED') {
      throw new BadRequestException('Cannot update a cancelled order');
    }

    const updatedOrder = await this.prismaService.order.update({
      where: { id: orderId, customerId },
      data: { ...request },
    });

    return {
      message: 'Order status was updated successfully',
      order: updatedOrder,
    };
  }

  async cancel(currentUser: User, customerId: number, orderId: number) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const orderToBeUpdated = subject('Order', {
      status: 'CANCELLED',
    });

    if (!ability.can('update', orderToBeUpdated, 'status')) {
      throw new ForbiddenException(
        'Tried to update an unauthorized resource (Order)',
      );
    }

    const order = await this.prismaService.order
      .update({
        where: { id: orderId, customerId },
        data: { status: 'CANCELLED' },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Invalid orderId');
          }
        }
        throw error;
      });

    return { message: 'Order was canceled successfully', order };
  }

  async refund(
    currentUser: User,
    customerId: number,
    orderId: number,
    request: RefundOrderRequestDto,
  ) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const orderToBeRefunded = subject('Order', {
      customerId,
    });

    if (!ability.can('read', orderToBeRefunded)) {
      throw new ForbiddenException(
        'Tried to access an unauthorized resource (Order)',
      );
    }

    const order = await this.prismaService.order
      .findUniqueOrThrow({
        where: { id: orderId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Invalid orderId');
          }
        }
        throw error;
      });

    if (order.status != 'CANCELLED')
      throw new BadRequestException(
        `Order status is ${order.status}, and only canceled orders are refunded`,
      );

    const transactions = await this.prismaService.orderTransaction.findMany({
      where: { orderId },
    });

    const lastTransaction = transactions[transactions.length - 1];

    if (lastTransaction.paymentState !== 'SUCCEEDED') {
      throw new BadRequestException(
        `The payment state of the order is ${lastTransaction.paymentState}. It cannot be refunded`,
      );
    }

    let refundTransaction = null;

    if (lastTransaction.paymentMethod == 'CARD') {
      const refund = await this.stripeService.refundPayment(orderId);

      if (refund.failure_reason) {
        throw new BadRequestException(
          `Refund failed. reason ${refund.failure_reason}`,
        );
      }

      let refundPaymentState = null;
      if (['succeeded', 'pending', 'failed'].includes(refund?.status)) {
        refundPaymentState = refund.status.toUpperCase();
      }

      refundTransaction = await this.prismaService.orderTransaction.create({
        data: {
          customerId,
          orderId,
          paymentMethod: lastTransaction.paymentMethod,
          paymentState: refundPaymentState,
          amount: lastTransaction.amount,
          type: 'DEBIT',
        },
      });
    } else {
      if (!request?.paymentState) {
        throw new BadRequestException('Provide paymentState for cash refunds');
      }

      refundTransaction = await this.prismaService.orderTransaction.create({
        data: {
          customerId: order.customerId,
          orderId,
          paymentMethod: lastTransaction.paymentMethod,
          paymentState: request.paymentState,
          amount: lastTransaction.amount,
          type: 'DEBIT',
        },
      });
    }

    return {
      message: 'Refund transaction was created successfully',
      transaction: refundTransaction,
    };
  }
}
