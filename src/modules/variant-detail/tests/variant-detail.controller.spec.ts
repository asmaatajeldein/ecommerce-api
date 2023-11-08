import { Test, TestingModule } from '@nestjs/testing';
import { VariantDetailController } from '../variant-detail.controller';
import { VariantDetailService } from '../variant-detail.service';

describe('VariantDetailController', () => {
  let controller: VariantDetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VariantDetailController],
      providers: [VariantDetailService],
    }).compile();

    controller = module.get<VariantDetailController>(VariantDetailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
