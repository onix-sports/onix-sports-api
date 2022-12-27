import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { storiesConstants } from './stories-constants';
import { StorySchema } from './schemas/story.schema';
import { StoriesRepository } from './stories.repository';
import { StoriesGateway } from './stories.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: storiesConstants.models.stories,
        collection: storiesConstants.models.stories,
        schema: StorySchema,
      },
    ]),
  ],
  controllers: [StoriesController],
  providers: [StoriesService, StoriesRepository, StoriesGateway],
  exports: [StoriesService],
})
export class StoriesModule {}
