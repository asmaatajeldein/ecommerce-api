import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVoucherRequestDto, UpdateVoucherRequestDto } from './dto';
import { PrismaService } from 'src/database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class VoucherService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(request: CreateVoucherRequestDto) {
    const createdVoucher = await this.prismaService.voucher
      .create({
        data: { ...request },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2002') {
            throw new ForbiddenException(
              "There's an existing voucher with that code",
            );
          } else if (error.code == 'P2000') {
            throw new BadRequestException('Voucher code is too long');
          }
        }
      });

    return createdVoucher;
  }

  async getAll() {
    return { vouchers: await this.prismaService.voucher.findMany() };
  }

  async getOneById(voucherId: number) {
    const voucher = await this.prismaService.voucher
      .findUniqueOrThrow({
        where: { id: voucherId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Voucher was not found');
          }
        }
      });

    return voucher;
  }

  async getOneByVoucherCode(voucherCode: string) {
    const voucher = await this.prismaService.voucher
      .findUniqueOrThrow({
        where: { code: voucherCode },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Voucher was not found');
          }
        }
      });

    return voucher;
  }

  async update(voucherId: number, request: UpdateVoucherRequestDto) {
    const updatedVoucher = await this.prismaService.voucher
      .update({
        where: { id: voucherId },
        data: { ...request },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Voucher was not found');
          } else if (error.code == 'P2000') {
            throw new BadRequestException('Voucher name is too long');
          } else if (error.code == 'P2002') {
            throw new ForbiddenException(
              "There's an existing voucher with that code",
            );
          }
        }
      });

    return updatedVoucher;
  }

  async delete(voucherId: number) {
    const deletedVoucher = await this.prismaService.voucher
      .delete({
        where: { id: voucherId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Voucher was not found');
          }
        }
      });

    return {
      message: 'Voucher was deleted successfully',
      voucher: deletedVoucher,
    };
  }
}
