import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  CreateCartItemRequestDto,
  UpdateCartItemRequestDto,
} from '../cart-item/dto';
import { AbilityFactory } from 'src/ability/ability.factory';
import { User } from '@prisma/client';
import { subject } from '@casl/ability';

@Injectable()
export class CartItemService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  async add(
    currentUser: User,
    customerId: number,
    request: CreateCartItemRequestDto[],
  ) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const cartItemToBeAdded = subject('ProductCustomer', {
      ...request,
      customerId,
    });

    if (!ability.can('create', cartItemToBeAdded)) {
      throw new ForbiddenException(
        'Tried to create an unauthorized resource (ProductCustomer)',
      );
    }

    if (!(request instanceof Array)) {
      throw new BadRequestException(
        'Please, provide an array of items to add to the user cart',
      );
    }

    await this.prismaService.customer
      .update({
        where: { id: customerId },
        data: {
          cartItems: {
            createMany: {
              data: [...request],
              skipDuplicates: true,
            },
          },
        },
        select: { cartItems: true },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2003') {
            throw new BadRequestException(
              "There's an invalid productVariantId",
            );
          }
        }
        throw error;
      });

    return await this.getAll(currentUser, customerId);
  }

  async getAll(currentUser: User, customerId: number) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const cartItemToBeRead = subject('ProductCustomer', {
      customerId,
    });

    if (!ability.can('read', cartItemToBeRead)) {
      throw new ForbiddenException(
        'Tried to read an unauthorized resource (ProductCustomer)',
      );
    }

    const cartItems = await this.prismaService.productCustomer.findMany({
      where: { customerId },
    });

    return { cartItems };
  }

  async update(
    currentUser: User,
    customerId: number,
    itemId: number,
    request: UpdateCartItemRequestDto,
  ) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const cartItemToBeUpdated = subject('ProductCustomer', {
      ...request,
      customerId,
    });

    if (!ability.can('update', cartItemToBeUpdated)) {
      throw new ForbiddenException(
        'Tried to update an unauthorized resource (ProductCustomer)',
      );
    }

    await this.prismaService.productCustomer
      .update({
        where: {
          customerId,
          id: itemId,
        },
        data: { quantity: request.quantity },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('CartItem was not found');
          }
        }
        throw error;
      });

    return await this.getAll(currentUser, customerId);
  }

  async delete(currentUser: User, customerId: number, itemId: number) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const cartItemToBeDeleted = subject('ProductCustomer', {
      customerId,
    });

    if (!ability.can('read', cartItemToBeDeleted)) {
      throw new ForbiddenException(
        'Tried to delete an unauthorized resource (ProductCustomer)',
      );
    }

    await this.prismaService.productCustomer
      .delete({
        where: { id: itemId, customerId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('CartItem was not found');
          }
        }
        throw error;
      });

    return await this.getAll(currentUser, customerId);
  }
}
