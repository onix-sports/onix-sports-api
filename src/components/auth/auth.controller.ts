import { UserEntity } from '@components/users/schemas/user.schema';
import Authorized from '@decorators/authorized.decorator';
import RequestUser from '@decorators/request-user.decorator';
import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import JwtPayloadDto from './dto/jwt-payload.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import TelegramCallbackDto from './dto/telegram-callback.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // @Get('/telegram/sign-in')
  // public async telegramSignIn(@Res() response: any) {
  //   const [botId] = this.configService.get<string>('TELEGRAM_API_KEY')!.split(':');

  //   return response.send(`
  //     <body>
  //       <script src="https://telegram.org/js/telegram-widget.js?21" data-telegram-login="${this.configService.get<string>('BOT_USERNAME')}" 
  //       data-size="medium" data-radius="0" data-auth-url="/auth/telegram/callback" data-request-access="write"></script>

  //       <script>
  //         window.Telegram.Login.auth({ bot_id: '${botId}', request_access: true }, (data) => {
  //           fetch('/auth/telegram/callback', { 
  //               method: 'POST', 
  //               body: JSON.stringify(data),
  //               headers: {
  //                   'Content-type': 'application/json'
  //               }
  //           });          
  //         })
  //       </script>
  //     </body>
  //   `);
  // }

  @Post('/telegram/callback')
  public telegramCallback(@Body() { hash, authDate, ...payload }: TelegramCallbackDto) {
    return this.authService.login(payload);
  }

  @Post('/refresh-token')
  public refreshToken(@Body() { refreshToken }: RefreshTokenDto) {
    return this.authService.refreshToken(refreshToken);
  }

  @Delete('/logout')
  @Authorized()
  public async logout(@RequestUser() user: JwtPayloadDto) {
      await this.authService.logout(user.telegram.id);

      return { message: 'Logged out' };
  }
}
