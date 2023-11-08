import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { CreateVoucherRequestDto, UpdateVoucherRequestDto } from './dto';
import { CheckAbility } from 'src/common/decorators';

@Controller('vouchers')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @CheckAbility({ action: 'create', subject: 'Voucher' })
  @Post()
  create(@Body() request: CreateVoucherRequestDto) {
    return this.voucherService.create(request);
  }

  @CheckAbility({ action: 'read', subject: 'Voucher' })
  @Get()
  getAll(@Query('voucherCode') voucherCode: string) {
    if (voucherCode) {
      return this.voucherService.getOneByVoucherCode(voucherCode);
    }
    return this.voucherService.getAll();
  }

  @CheckAbility({ action: 'read', subject: 'Voucher' })
  @Get(':voucherId')
  getOneById(@Param('voucherId', ParseIntPipe) voucherId: number) {
    return this.voucherService.getOneById(voucherId);
  }

  @CheckAbility({ action: 'update', subject: 'Voucher' })
  @Patch(':voucherId')
  update(
    @Param('voucherId', ParseIntPipe) voucherId: number,
    @Body() request: UpdateVoucherRequestDto,
  ) {
    return this.voucherService.update(voucherId, request);
  }

  @CheckAbility({ action: 'delete', subject: 'Voucher' })
  @Delete(':voucherId')
  delete(@Param('voucherId', ParseIntPipe) voucherId: number) {
    return this.voucherService.delete(voucherId);
  }
}
