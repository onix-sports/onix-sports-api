import { Controller, Get, HttpStatus, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ParseNumberPipe } from '@pipes/number.pipe';
import { ParseObjectIdPipe } from '@pipes/objectId.pipe';
import { ObjectId } from 'mongodb';
import { StoriesService } from './stories.service';

@ApiTags('Stories')
@Controller('stories')
export class StoriesController {
  constructor(
    private readonly storiesService: StoriesService,
  ) {}

}