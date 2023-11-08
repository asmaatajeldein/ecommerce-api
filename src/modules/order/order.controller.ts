import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { OrderService } from './order.service';
import {
  CreateOrderRequestDto,
  RefundOrderRequestDto,
  UpdateOrderAddressRequestDto,
  UpdateOrderStatusRequestDto,
} from './dto';
import { CheckAbility, GetUser } from 'src/common/decorators';
import { User } from '@prisma/client';

@Controller('customers/:customerId/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Body() request: CreateOrderRequestDto,
  ) {
    return this.orderService.create(currentUser, customerId, request);
  }

  @Get()
  getAll(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.orderService.getAll(currentUser, customerId);
  }

  @CheckAbility({ action: 'read', subject: 'OrderTransaction' })
  @Get('/transactions')
  getAllTransactions(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.orderService.getAllTransactions(customerId);
  }

  @Get(':orderId')
  getOneById(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.orderService.getOneById(currentUser, customerId, orderId);
  }

  @CheckAbility({ action: 'read', subject: 'OrderTransaction' })
  @Get(':orderId/transactions')
  getTransactionsById(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.orderService.getTransactionsById(customerId, orderId);
  }

  @Patch(':orderId/address')
  updateAddress(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() request: UpdateOrderAddressRequestDto,
  ) {
    return this.orderService.updateAddress(
      currentUser,
      customerId,
      orderId,
      request,
    );
  }

  @Patch(':orderId/status')
  updateStatus(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() request: UpdateOrderStatusRequestDto,
  ) {
    return this.orderService.updateStatus(
      currentUser,
      customerId,
      orderId,
      request,
    );
  }

  @CheckAbility({ action: 'update', subject: 'Order', fields: ['status'] })
  @Patch(':orderId/cancel')
  cancel(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.orderService.cancel(currentUser, customerId, orderId);
  }

  @Post(':orderId/refund')
  refund(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() request: RefundOrderRequestDto,
  ) {
    return this.orderService.refund(currentUser, customerId, orderId, request);
  }
}
