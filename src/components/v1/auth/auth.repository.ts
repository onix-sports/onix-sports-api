import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export default class AuthRepository {
    private readonly redisClient: Redis;

    constructor(
        private readonly redisService: RedisService,
    ) {
        this.redisClient = redisService.getClient();
    }

    public addRefreshToken(id: number, refreshToken: string) {
        return this.redisClient.set(`refreshToken:${id}`, refreshToken);
    }

    public deleteRefreshToken(id: number) {
        return this.redisClient.del(`refreshToken:${id}`);
    }

    public getRefreshToken(id: number) {
        return this.redisClient.get(`refreshToken:${id}`);
    }
}
