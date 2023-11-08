import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateBrandRequestDto, UpdateBrandRequestDto } from './dto';
import { AbilityFactory } from 'src/ability/ability.factory';
import { User } from '@prisma/client';

@Injectable()
export class BrandService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  async create(currentUser: User, request: CreateBrandRequestDto) {
    // const ability = this.abilityFactory.defineAbilityFor(currentUser);

    // const brandToBeCreated = subject('Brand', { name: request.name });

    // if (!ability.can('create', brandToBeCreated)) {
    //   throw new ForbiddenException(
    //     'Tried to create an unauthorized resource (Brand)',
    //   );
    // }
    const createdBrand = await this.prismaService.brand
      .create({
        data: { ...request },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2002') {
            throw new ForbiddenException(
              "There's an existing brand with that name",
            );
          }
        }
        throw error;
      });

    return createdBrand;
  }

  async getAll() {
    const brands = await this.prismaService.brand.findMany();

    return { brands };
  }

  async getOneByName(brandName: string) {
    const brand = await this.prismaService.brand
      .findUniqueOrThrow({
        where: { name: brandName },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Brand was not found');
          }
        }
        throw error;
      });

    return brand;
  }

  async getOneById(brandId: number) {
    const brand = await this.prismaService.brand
      .findUniqueOrThrow({
        where: { id: brandId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Brand was not found');
          }
        }
        throw error;
      });

    return brand;
  }

  async update(brandId: number, request: UpdateBrandRequestDto) {
    const updatedBrand = await this.prismaService.brand
      .update({
        where: { id: brandId },
        data: { ...request },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Brand was not found');
          } else if (error.code == 'P2002') {
            throw new BadRequestException(
              "There's an existing brand with that name",
            );
          }
        }
        throw error;
      });

    return { message: 'Brand was updated successfully', brand: updatedBrand };
  }

  async delete(brandId: number) {
    const deletedBrand = await this.prismaService.brand
      .delete({
        where: { id: brandId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Brand was not found');
          }
        }
        throw error;
      });

    return {
      message: 'Brand was deleted successfully',
      product: deletedBrand,
    };
  }
}
