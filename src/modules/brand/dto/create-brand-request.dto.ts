import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBrandRequestDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  name: string;
}
