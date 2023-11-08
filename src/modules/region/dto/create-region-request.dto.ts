import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRegionRequestDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;
}
