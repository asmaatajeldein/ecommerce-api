import { Test, TestingModule } from '@nestjs/testing';
import { VariantDetailService } from '../variant-detail.service';

describe('VariantDetailService', () => {
  let service: VariantDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VariantDetailService],
    }).compile();

    service = module.get<VariantDetailService>(VariantDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
