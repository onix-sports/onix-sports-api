import { Module, OnModuleInit } from '@nestjs/common';
import { PuppeteerModule as MainPuppeteerModule } from 'nest-puppeteer';
import fs from 'fs/promises';
import { PuppeteerService } from './puppeteer.service';
import { ScreenshotRepository } from './screenshots.repository';
import puppeteerConstants from './puppeteer.constants';

@Module({
    imports: [MainPuppeteerModule.forFeature()],
    providers: [PuppeteerService, ScreenshotRepository],
    exports: [PuppeteerService],
})
export class PuppeteerModule implements OnModuleInit {
    async onModuleInit() {
        await fs.mkdir(puppeteerConstants.folders.uploads).catch((error) => {
            if (error.code !== puppeteerConstants.errors.fs.fileExists) {
                throw new Error(`Failed to init ${PuppeteerModule.name}`);
            }
        });
    }
}
