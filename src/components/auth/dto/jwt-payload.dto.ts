import { RolesEnum } from "@decorators/roles.decorator";
import { ApiProperty } from "@nestjs/swagger";
import { ObjectId } from "mongodb";
import LoginDto from "./login.dto";

export default class JwtPayloadDto {
    @ApiProperty({ type: String })
    _id: ObjectId;

    @ApiProperty({ enum: RolesEnum })
    role: RolesEnum;

    @ApiProperty({ type: LoginDto })
    telegram: LoginDto
}
