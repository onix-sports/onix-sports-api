import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import SignUpDto from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Post('sign-up')
  public signup(@Body() signUpDto: SignUpDto) {
    return this.authService.createUser(signUpDto);
  }
}
