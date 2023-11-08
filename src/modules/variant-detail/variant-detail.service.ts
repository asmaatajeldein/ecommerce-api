import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import {
  CreateVariantDetailRequestDto,
  UpdateVariantDetailRequestDto,
} from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class VariantDetailService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(variantId: number, request: CreateVariantDetailRequestDto) {
    const createdVaritantDetail = await this.prismaService.variantDetail
      .create({
        data: {
          productVariant: { connect: { id: variantId } },
          detail: { connect: { id: request.detailId } },
          detailValue: {
            create: {
              detail: { connect: { id: request.detailId } },
              value: request.value,
            },
          },
        },
        select: { productVariant: true, detail: true, detailValue: true },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Invalid categoryId or datatypeId');
          } else if (error.code == 'P2002') {
            throw new BadRequestException(
              'This detail already exists for this variant',
            );
          }
        }
      });

    return createdVaritantDetail;
  }

  async getAll(variantId: number) {
    return await this.prismaService.productVariant
      .findUniqueOrThrow({
        where: { id: variantId },
        select: {
          details: {
            select: { productVariant: true, detail: true, detailValue: true },
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Variant was not found');
          }
        }
      });
  }

  async getOneById(variantId: number, detailId: number) {
    const variantDetail = await this.prismaService.variantDetail
      .findUniqueOrThrow({
        where: {
          productVariantId_detailId: {
            productVariantId: variantId,
            detailId,
          },
        },
        select: { productVariant: true, detail: true, detailValue: true },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Variant detail was not found');
          }
        }
      });

    return variantDetail;
  }

  async update(
    variantId: number,
    detailId: number,
    request: UpdateVariantDetailRequestDto,
  ) {
    const updatedVariantDetail = await this.prismaService.variantDetail
      .update({
        where: {
          productVariantId_detailId: { productVariantId: variantId, detailId },
        },
        data: { detailValue: { update: { data: { value: request.value } } } },
        select: { productVariant: true, detail: true, detailValue: true },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Variant detail was not found');
          }
        }
      });

    return updatedVariantDetail;
  }

  async delete(variantId: number, detailId: number) {
    const deletedVariantDetail = await this.prismaService.variantDetail
      .delete({
        where: {
          productVariantId_detailId: { productVariantId: variantId, detailId },
        },
        select: { productVariant: true, detail: true, detailValue: true },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Variant detail was not found');
          }
        }
      });

    return {
      message: 'Variant detail was deleted successfully',
      varinat_detail: deletedVariantDetail,
    };
  }
}
