import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateAddressRequestDto, UpdateAddressRequestDto } from './dto';
import { AbilityFactory } from 'src/ability/ability.factory';
import { Prisma, User } from '@prisma/client';
import { subject } from '@casl/ability';

@Injectable()
export class AddressService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  private addressSelect = Prisma.validator<Prisma.AddressSelect>()({
    id: true,
    address1: true,
    address2: true,
    default: true,
    city: {
      select: {
        id: true,
        name: true,
        region: {
          select: {
            id: true,
            name: true,
            country: true,
          },
        },
      },
    },
  });

  async create(
    currentUser: User,
    customerId: number,
    request: CreateAddressRequestDto,
  ) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const addressToBeCreated = subject('Address', { ...request, customerId });

    if (!ability.can('create', addressToBeCreated)) {
      throw new ForbiddenException(
        'Tried to create an unauthorized resource (Address)',
      );
    }

    const createdAddress = await this.prismaService.address
      .create({
        data: {
          customerId,
          ...request,
        },
        select: this.addressSelect,
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2003') {
            throw new BadRequestException('Invalid cityId');
          }
        }
        throw error;
      });

    return createdAddress;
  }

  async getAll(currentUser: User, customerId: number) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const addressToBeRead = subject('Address', { customerId });

    if (!ability.can('read', addressToBeRead)) {
      throw new ForbiddenException(
        'Tried to read an unauthorized resource (Address)',
      );
    }

    const addresses = await this.prismaService.address.findMany({
      where: { customerId },
      select: this.addressSelect,
    });

    return {
      addresses,
    };
  }

  async getOneById(currentUser: User, customerId: number, addressId: number) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const addressToBeRead = subject('Address', { customerId });

    if (!ability.can('read', addressToBeRead)) {
      throw new ForbiddenException(
        'Tried to read an unauthorized resource (Address)',
      );
    }

    const address = await this.prismaService.address
      .findUniqueOrThrow({
        where: { id: addressId, customerId },
        select: {
          id: true,
          address1: true,
          address2: true,
          default: true,
          city: {
            select: {
              id: true,
              name: true,
              region: {
                select: {
                  id: true,
                  name: true,
                  country: true,
                },
              },
            },
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Address was not found');
          }
        }
        throw error;
      });

    return address;
  }

  async update(
    currentUser: User,
    customerId: number,
    addressId: number,
    request: UpdateAddressRequestDto,
  ) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const addressToBeUpdated = subject('Address', { ...request, customerId });

    if (!ability.can('update', addressToBeUpdated)) {
      throw new ForbiddenException(
        'Tried to update an unauthorized resource (Address)',
      );
    }

    const updatedAddress = await this.prismaService.address
      .update({
        where: { id: addressId, customerId },
        data: { ...request },
        select: this.addressSelect,
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Address was not found');
          }
        }
        throw error;
      });

    return {
      message: 'Address was updated successfully',
      address: updatedAddress,
    };
  }

  async setDefault(currentUser: User, customerId: number, addressId: number) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const addressToBeRead = subject('Address', { customerId });

    if (!ability.can('update', addressToBeRead, 'default')) {
      throw new ForbiddenException(
        'Tried to update an unauthorized resource (Address)',
      );
    }

    const defaultAddress = await this.prismaService.address.findFirst({
      where: { customerId, default: { equals: true } },
    });

    if (defaultAddress) {
      await this.prismaService.address.update({
        where: { id: defaultAddress.id },
        data: { default: false },
      });
    }

    const newDefault = await this.prismaService.address
      .update({
        where: { id: addressId },
        data: { default: true },
        select: this.addressSelect,
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new BadRequestException('Invalid addressId');
          }
        }
        throw error;
      });

    return { message: 'Default address was changed', address: newDefault };
  }

  async delete(currentUser: User, customerId: number, addressId: number) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const addressToBeDeleted = subject('Address', { customerId });

    if (!ability.can('delete', addressToBeDeleted)) {
      throw new ForbiddenException(
        'Tried to delete an unauthorized resource (Address)',
      );
    }

    const deletedAddress = await this.prismaService.address
      .delete({
        where: { id: addressId, customerId },
        select: this.addressSelect,
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Address was not found');
          }
        }
        throw error;
      });

    return {
      message: 'Address was deleted successfully',
      address: deletedAddress,
    };
  }
}
