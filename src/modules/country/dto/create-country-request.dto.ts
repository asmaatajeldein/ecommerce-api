import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCountryRequestDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(3)
  code: string;
}
