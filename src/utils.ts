import * as fs from 'fs';

export async function listDir(dir: string) {
    try {
        return await fs.promises.readdir(dir);
    } catch (err) {
        console.error('Error occurred while reading directory!', err);
    }
}