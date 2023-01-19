import { Loggable } from '../lib/loggable';
import { Client }   from 'pg';
import * as fs      from 'fs';
import { listDir }  from '../utils';
import { error }    from 'winston';

export class Hive extends Loggable {

    protected client: Client | null = null;

    private readonly TABLE_CHECK        = (tableName: string): string => `SELECT table_name
                                                                          FROM information_schema.tables
                                                                          WHERE table_schema = \'hephaestus\'
                                                                            AND table_name = \'${tableName}\';`;
    private readonly FILE_TRACKER_CHECK = (fileName: string): string => `SELECT success
                                                                         FROM hephaestus.tracker
                                                                         WHERE filename = \'${fileName}\';`;

    private readonly FILE_TRACKER_SET = (filename: string, state: boolean): string => `INSERT INTO hephaestus.tracker (filename, success) VALUES (\'${filename}\', \'${state}\');`

    public constructor () {
        super ('Hive');

        let user     = process.env.PG_USER || undefined;
        let password = process.env.PG_PASSWORD || undefined;
        let database = process.env.PG_DATABASE || undefined;
        let address  = process.env.PG_ADDRESS || undefined;
        let port     = Number.parseInt (process.env.PG_PORT || '') || undefined;

        this.client = new Client ({
            user: user,
            password: password,
            database: database,
            host: address,
            port: port
        });

        this.client.connect ();
    }

    public async createDb () {
        await this.initSchema ();
        await this.initTracker ();

        if (!this.client) {
            return;
        }

        let creationSQLFolder = process.env.CREATION_FOLDER || null;

        if (creationSQLFolder == null) {
            this.logger.error (`Environment Variable CREATION_FOLDER is not defined.`);
            return;
        }
        let files: string[] | undefined;
        let totalFiles  = -1;
        let currentFile = 0;

        files = await listDir (creationSQLFolder);

        console.log (files);

        if (files == null || files.length == 0) {
            this.logger.warn ('No files found for given creation folder.');
            return;
        }

        files = files.filter ((fileName) => {
            return fileName.includes ('.sql');
        });

        totalFiles = files.length;

        for (let file of files) {
            currentFile++;

            if (!creationSQLFolder.endsWith ('/')) {
                creationSQLFolder += '/';
            }

            let result = await this.client.query (this.FILE_TRACKER_CHECK (file));

            let c = false;

            if (result.rowCount == 0) {
                c = true;
            } else {
                this.logger.info(`Query [${file}] has already been run. ${currentFile}/${totalFiles}`);
            }

            if (c) {
                let query = fs.readFileSync (creationSQLFolder + file, { encoding: 'utf-8' });
                try {
                    await this.client.query (query);
                    await this.client.query (this.FILE_TRACKER_SET(file, true));
                    this.logger.info(`Query [${file}] has run successfully. ${currentFile}/${totalFiles}`);
                } catch {

                    throw error('');
                }

            }

            if (currentFile === totalFiles) {
                await this.client.end()
            }
        }
    }

    private async initSchema () {
        if (!this.client) {
            return;
        }

        let schemaQuery = await this.client.query ('SELECT schema_name FROM information_schema.schemata WHERE schema_name = \'hephaestus\';');

        if (schemaQuery.rowCount >= 1) {
            return;
        }

        await this.client.query ('CREATE SCHEMA hephaestus AUTHORIZATION CURRENT_USER;');
    }

    private async initTracker () {
        if (!this.client) {
            return;
        }

        let schemaQuery = await this.client.query (this.TABLE_CHECK ('tracker'));

        if (schemaQuery.rowCount >= 1) {
            return;
        }

        await this.client.query (`CREATE TABLE hephaestus.tracker
                                  (
                                      fileName VARCHAR,
                                      date     DATE DEFAULT NOW(),
                                      success  BOOLEAN
                                  );`);
    }
}