import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto, SignupRequestDto } from './dto';
import { GetUser, Public } from 'src/common/decorators';
import { RefreshTokenGuard } from 'src/common/guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup/customer')
  customerSignup(@Body() request: SignupRequestDto) {
    return this.authService.customerSignup(request);
  }

  @Public()
  @Post('login/customer')
  customerLogin(@Body() request: LoginRequestDto) {
    return this.authService.customerLogin(request);
  }

  @Post('logout/customer')
  customerLogout(@GetUser('id') currentUserId: number) {
    return this.authService.customerLogout(currentUserId);
  }

  @Public()
  @Post('login/admin')
  adminLogin(@Body() request: LoginRequestDto) {
    return this.authService.adminLogin(request);
  }

  @Post('logout/admin')
  adminLogout(@GetUser('id') currentUserId: number) {
    return this.authService.adminLogout(currentUserId);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refreshTokens(
    @GetUser('sub') currentUserId: number,
    @GetUser('refresh_token') refreshToken: string,
  ) {
    return this.authService.refreshTokens(currentUserId, refreshToken);
  }
}
