import { Module } from '@nestjs/common';
import { VariantDetailService } from './variant-detail.service';
import { VariantDetailController } from './variant-detail.controller';

@Module({
  controllers: [VariantDetailController],
  providers: [VariantDetailService],
})
export class VariantDetailModule {}
