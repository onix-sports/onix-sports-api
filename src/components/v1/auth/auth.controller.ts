import { ApiDefaultBadRequestResponse } from '@decorators/api-default-bad-request-response.decorator';
import { ApiResponse } from '@decorators/api-response.decorator';
import Authorized from '@decorators/authorized.decorator';
import RequestUser from '@decorators/request-user.decorator';
import {
    Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Query, Res, UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';
import validationPipe from '@pipes/validation.pipe';
import TelegramVerifiedGuard from '@guards/telegram-verified.guard';
import DebugResponse from '@decorators/debug-response.decorator';
import DevelopmentGuard from '@guards/development.guard';
import { AuthService } from './auth.service';
import JwtPayloadDto from './dto/jwt-payload.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import TelegramCallbackDto from './dto/telegram-callback.dto';
import TelegramSignInDto from './dto/telegram-sign-in.dto';
import { LocalLoginDto } from './dto/local-login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    ) {}

    @ApiResponse({
        description: 'Returns page with telegram login button',
    })
    @ApiDefaultBadRequestResponse()
    @HttpCode(HttpStatus.OK)
    @Get('/telegram/sign-in')
    public async telegramSignIn(
        @Query(validationPipe) { redirect }: TelegramSignInDto,
        @Res() response: any,
    ) {
        return response.send(`
        <body>
          <style>
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #54a9eb94;
              }
            
              iframe {
                transform: scale(5);
              }
          </style>

          <script src="https://telegram.org/js/telegram-widget.js?21" data-telegram-login="${this.configService.get<string>('BOT_USERNAME')}"
          data-size="medium" data-radius="0" data-onauth="onTelegramAuth(user)" data-request-access="write"></script>

          <script>
            function onTelegramAuth(data) {
                fetch('/v1/auth/telegram/callback', {
                      method: 'POST',
                      body: JSON.stringify(data),
                      headers: {
                          'Content-type': 'application/json'
                      }
                })
                .then(response => response.json())
                .then(({ data }) => {
                    window.location.href = \`${redirect}?accessToken=\${data.accessToken}&refreshToken=\${data.refreshToken}\`;
                });
            }
          </script>
        </body>
      `);
    }

    @ApiResponse({
        properties: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                },
                refreshToken: {
                    type: 'string',
                },
            },
        },
        description: 'Returns jwt tokens',
    })
    @ApiDefaultBadRequestResponse()
    @ApiForbiddenResponse({
        description: 'If request is not from telegram',
        schema: {
            example: {
                statusCode: HttpStatus.FORBIDDEN,
                timestamp: new Date().toISOString(),
                path: '/v1/auth/telegram/callback',
                message: 'Forbidden resource',
            },
        },
    })
    @HttpCode(HttpStatus.OK)
    @UseGuards(TelegramVerifiedGuard)
    @DebugResponse(true)
    @Post('/telegram/callback')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public telegramCallback(@Body() { hash, authDate, ...payload }: TelegramCallbackDto) {
        return this.authService.login(payload);
    }

    @ApiResponse({
        properties: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                },
                refreshToken: {
                    type: 'string',
                },
            },
        },
        description: 'Returns jwt tokens',
    })
    @ApiDefaultBadRequestResponse()
    @HttpCode(HttpStatus.OK)
    @UseGuards(DevelopmentGuard)
    @Post('/local-sign-in')
    localSignIn(@Body() body: LocalLoginDto) {
        return this.authService.localLogin(body.user);
    }

    @ApiResponse({
        properties: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                },
            },
        },
        description: 'Returns jwt access token',
    })
    @ApiDefaultBadRequestResponse()
    @HttpCode(HttpStatus.CREATED)
    @Post('/refresh-token')
    public refreshToken(@Body() { refreshToken }: RefreshTokenDto) {
        return this.authService.refreshToken(refreshToken);
    }

    @ApiResponse({
        description: 'no content',
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('/logout')
    @Authorized()
    public async logout(@RequestUser() user: JwtPayloadDto) {
        await this.authService.logout(user.telegram.id);

        return {};
    }
}
