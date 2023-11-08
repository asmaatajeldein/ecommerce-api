import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCategoryDetailRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  datatypeId: number;
}
