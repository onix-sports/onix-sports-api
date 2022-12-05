import { Injectable } from '@nestjs/common';
import { InjectPage } from 'nest-puppeteer';
import { Page, Viewport } from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import { setTimeout } from 'timers/promises';
import { Cron, CronExpression } from '@nestjs/schedule';
import ffmpeg from 'fluent-ffmpeg';
import { ScreenshotRepository } from './screenshots.repository';

export interface ScreenshotOptions {
  viewport?: Viewport;
  delay?: number;
  duration?: number;
  fps?: number;
}

@Injectable()
export class PuppeteerService {
    constructor(
    @InjectPage() private readonly page: Page,

    private readonly screenshotRepository: ScreenshotRepository,
    ) {}

    private async recordGif(options: { duration: number, path: string, fps: number, size: string }) {
        const recorder = new PuppeteerScreenRecorder(this.page, { fps: options.fps });
        const videoPath = this.screenshotRepository.newPath('mp4');

        await recorder.start(videoPath);
        await setTimeout(options.duration);
        await recorder.stop();

        const command = ffmpeg(videoPath)
            .fps(options.fps)
            .size(options.size)
            .output(options.path);

        await (() => {
            return new Promise((resolve) => {
                command.on('end', () => resolve(null));
                command.run();
            });
        })();
    }

    public async screenshot(html: string, options?: ScreenshotOptions) {
        const viewport = options?.viewport || { width: 600, height: 550 };

        await this.page.setViewport(viewport);
        await this.page.setContent(html, { waitUntil: 'load' });

        const path = this.screenshotRepository.newPath(options?.duration ? 'gif' : 'png');

        await setTimeout(options?.delay || 0);

        if (options?.duration) {
            await this.recordGif({
                duration: options.duration,
                fps: options.fps || 25,
                size: `${viewport.width}x${viewport.height}`,
                path,
            });
        } else {
            await this.page.screenshot({ path });
        }

        return path;
    }

    public unlockFile(path: string) {
        return this.screenshotRepository.unlockPath(path);
    }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    private clearFolder() {
        return this.screenshotRepository.clearAll();
    }
}
