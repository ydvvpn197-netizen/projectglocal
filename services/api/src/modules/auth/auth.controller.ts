import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    // MVP stub: always succeed, issue tokens for provided email
    const accessToken = this.auth.issueAccessToken({ sub: body.email });
    const refreshToken = this.auth.issueRefreshToken({ sub: body.email });
    return { accessToken, refreshToken };
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    // MVP stub: issue a new access token without verification
    const accessToken = this.auth.issueAccessToken({ sub: 'stub' });
    return { accessToken };
  }
}



