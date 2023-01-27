import { Loggable }     from '../lib/loggable';
import { Client }       from 'pg';
import * as fs          from 'fs';
import { listDir }      from '../utils';
import * as ProgressBar from 'progress';

export class Hive extends Loggable {

    public static INSTANCE: Hive;
    protected client: Client;

    public constructor () {
        super ('Hive');
        Hive.INSTANCE = this;

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

    /**
     * Runs a query against a database.
     * @param query
     */
    public async sendQuery (query: string) {
        try {
            await this.client?.query (query);
        } catch (e) {
            this.logger.error (`An SQL query failed to run: \n Query ${query}. \n${e}`)
        }
    }

    /**
     * Create the database.
     */
    public async createDatabase () {
        // Check if the schema exists, and create the schema if it doesn't.
        await this.initSchema ();
        // Check if the tracker table exist.
        await this.initTracker ();
        // Get the creation SQL folder from the environment variables.
        let creationSQLFolder = process.env.CREATION_FOLDER || null;
        // If the creation SQL folder does not exist, error out.
        if (creationSQLFolder == null) {
            this.logger.error (`Environment Variable CREATION_FOLDER is not defined.`);
            return;
        }
        // Define some variables.
        let files: string[] | undefined;
        let totalFiles  = -1;
        let currentFile = 0;
        // Get the contents of the creation SQL folder
        files           = await listDir (creationSQLFolder);
        // If there are no folders, we don't need to create anything.
        if (files == null || files.length == 0) {
            // Warn just in-case this wasn't expected.
            this.logger.warn ('No files found for given creation folder.');
            return;
        }
        // Filter files, we only want SQL files.
        files      = files.filter ((fileName) => {
            return fileName.includes ('.sql');
        });
        // Get the total number of SQL files that will be run.
        totalFiles = files.length;
        // Initialise the progress bar.
        let bar    = new ProgressBar ('Creating DB |:bar| :current/:total :rate', { total: totalFiles, width: 50, incomplete: ' ' });
        // If the folder environment variable doesn't
        //  have a forward slash at the end then add it.
        if (!creationSQLFolder.endsWith ('/')) {
            creationSQLFolder += '/';
        }

        for (let file of files) {
            currentFile++;
            // Check if the file has already run.
            let result = await this.client.query (this.createFileRanSuccessfullyQuery (file));

            let fileRan = false;
            // If the row count is more than zero, then the file probably ran.
            if (result.rowCount >= 1) {
                fileRan = true;
            } else {
                // this.logger.info (`Query [${file}] has already been run. ${currentFile}/${totalFiles}`);
                bar.tick ();
            }

            if (!fileRan) {
                // Read the file.
                let query = fs.readFileSync (creationSQLFolder + file, { encoding: 'utf-8' });
                try {
                    // Run the query.
                    await this.client.query (query);
                    await this.client.query (this.createFileRunSuccessQuery (file, true));
                    // Increment the progress bar.
                    bar.tick ();
                } catch (e) {
                    // If the query failed, log an error.
                    this.logger.error (`Query [${file}] has failed to run, returned error: ${e}`);
                }

            }
            // If the current file equals the total number, end the database client.
            if (currentFile === totalFiles) {
                await this.client.end ();
            }

        }
    }

    /**
     * Creates the hephaestus schema.
     * @private
     */
    private async initSchema () {
        // Query if the hephaestus schema exists
        let schemaQuery = await this.client.query ('SELECT schema_name FROM information_schema.schemata WHERE schema_name = \'hephaestus\';');
        // If the row count for the above query returns a row count greater than one then the schema doesn't exist.
        if (schemaQuery.rowCount >= 1) {
            return;
        }
        // If the schema doesn't exist, create it.
        await this.client.query ('CREATE SCHEMA hephaestus AUTHORIZATION CURRENT_USER;');
    }

    /**
     * Used to create a postgresql query to check if a table exists.
     * @param tableName
     * @private
     */
    private createTableCheckQuery (tableName: string): string {
        return `SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = \'hephaestus\'
                  AND table_name = \'${tableName}\';`;
    };

    /**
     * Creates a postgresql query to check if a SQL file has run sucessfully.
     * @param fileName
     * @constructor
     * @private
     */
    private createFileRanSuccessfullyQuery (fileName: string): string {
        return `SELECT success
                FROM hephaestus.tracker
                WHERE filename = \'${fileName}\';`;
    };

    private createFileRunSuccessQuery (filename: string, state: boolean): string {
        return `INSERT INTO hephaestus.tracker (filename, success)
                VALUES (\'${filename}\', \'${state}\');`;
    };

    /**
     * Creates the database maintenance table.
     * @private
     */
    private async initTracker () {
        // Check if the tracker table exists.
        let schemaQuery = await this.client.query (this.createTableCheckQuery ('tracker'));
        // If the row count is greater than zero, then the tracker table already exists.
        if (schemaQuery.rowCount >= 1) {
            return;
        }
        // If the row count is zero, then create the tracker table.
        await this.client.query (`CREATE TABLE hephaestus.tracker
                                  (
                                      fileName VARCHAR,
                                      date     DATE DEFAULT NOW(),
                                      success  BOOLEAN
                                  );`);
    }
}