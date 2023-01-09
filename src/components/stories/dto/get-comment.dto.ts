import { IntersectionType } from '@nestjs/swagger';

import { PaginationDto } from '@components/common/dto/pagination.dto';

import { GetStoryDto } from './get-story.dto';

export class GetStoryInfoDto extends IntersectionType(
  GetStoryDto,
  PaginationDto
) {}