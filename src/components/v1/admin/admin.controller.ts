import { ApiDefaultBadRequestResponse } from '@decorators/api-default-bad-request-response.decorator';
import { ApiDefaultNotFoundResponse } from '@decorators/api-default-not-found-response.decorator';
import { ApiResponse } from '@decorators/api-response.decorator';
import Authorized from '@decorators/authorized.decorator';
import { RolesEnum } from '@decorators/roles.decorator';
import {
    Controller, Delete, HttpCode, HttpStatus, Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import validationPipe from '@pipes/validation.pipe';
import { AdminService } from './admin.service';
import { DeleteGameDto } from './dto/delete-game.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
    ) {}

    @ApiDefaultBadRequestResponse()
    @ApiDefaultNotFoundResponse('Game not found')
    @ApiResponse({
        description: 'Deletes game and all statistics related to it',
    })
    @HttpCode(HttpStatus.OK)
    @Authorized(RolesEnum.admin)
    @Delete('/game/:id')
    public async deleteGame(@Param(validationPipe) { id }: DeleteGameDto) {
        return this.adminService.deleteGame(id).then(() => ({ success: true }));
    }
}
