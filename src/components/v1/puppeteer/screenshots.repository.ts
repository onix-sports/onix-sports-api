import { Injectable, Logger } from '@nestjs/common';
import fs from 'fs/promises';
import puppeteerConstants from './puppeteer.constants';

@Injectable()
export class ScreenshotRepository {
    private src = puppeteerConstants.folders.uploads;

    private storage: {[key: string]: boolean} = {};

    private logger: Logger = new Logger(ScreenshotRepository.name);

    public newPath(extention: 'gif' | 'png' | 'mp4') {
        const newPath = `${this.src}/${Math.random().toString(36)}-${Date.now()}.${extention}`;

        this.savePath(newPath);

        return newPath;
    }

    public unlockPath(path: string) {
        this.logger.log(`Unlocking path: ${path}`);

        this.storage[path] = true;
    }

    private savePath(path: string) {
        this.storage[path] = true;

        return true;
    }

    public async clearAll() {
        await fs.readdir(this.src).then((files) => {
            this.logger.log(`Before clearing ${files.join(', \n')} \n ${JSON.stringify(this.storage)}`);
        });

        const promises = Object
            .keys(this.storage)
            .filter((path) => this.storage[path])
            .map((path) => {
                delete this.storage[path];

                return fs.unlink(path);
            });

        return Promise
            .all(promises)
            .then(() => {
                this.logger.log('Cleared all screenshots');

                fs.readdir(this.src).then((files) => {
                    this.logger.log(`After clearing ${files.join(', ')} \n ${JSON.stringify(this.storage)}`);
                });
            })
            .catch((error) => {
                this.logger.error(`Something went wrong on clearing screenshots: ${error}`);
            });
    }
}
