import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCityRequestDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;
}
