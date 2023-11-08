import { Module } from '@nestjs/common';
import { CategoryDetailService } from './category-detail.service';
import { CategoryDetailController } from './category-detail.controller';

@Module({
  controllers: [CategoryDetailController],
  providers: [CategoryDetailService],
})
export class CategoryDetailModule {}
