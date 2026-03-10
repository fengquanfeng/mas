import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('api')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('token')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }
}
