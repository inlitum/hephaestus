import { Client }   from 'pg';
import * as fs      from 'fs';
import { OSRSItem } from '../types/osrs-types';

export class Populate {
    client: Client | null = null;

    public constructor () {
        this.client = new Client ({ user: 'n2acd_owner', password: 'n2acd_owner', database: 'n2in' });
        this.client.connect ();

        this.initSchema ().then (() => {
            this.initTables ().then (() => {
                this.readItems ();
                // this.client?.end();
            });
        });

    }

    public async initSchema () {
        if (!this.client) {
            return;
        }

        let schemaQuery = await this.client.query ('SELECT schema_name FROM information_schema.schemata WHERE schema_name = \'hephaestus\';');

        if (schemaQuery.rowCount >= 1) {
            return;
        }

        await this.client.query ('CREATE SCHEMA hephaestus AUTHORIZATION CURRENT_USER;');
    }

    public async initTables () {
        if (!this.client) {
            return;
        }

        let createItemsTable = `CREATE TABLE IF NOT EXISTS hephaestus.items
                                (
                                    id                    INTEGER PRIMARY KEY,
                                    name                  VARCHAR(255) NOT NULL,
                                    last_updated          VARCHAR(255) NOT NULL,
                                    incomplete            boolean      NOT NULL,
                                    members               boolean      NOT NULL,
                                    tradeable             boolean      NOT NULL,
                                    tradeable_on_ge       boolean      NOT NULL,
                                    stackable             boolean      NOT NULL,
                                    stacked               INTEGER,
                                    noted                 boolean      NOT NULL,
                                    noteable              boolean      NOT NULL,
                                    linked_id_item        INTEGER,
                                    linked_id_noted       INTEGER,
                                    linked_id_placeholder INTEGER,
                                    placeholder           boolean      NOT NULL,
                                    equipable             boolean      NOT NULL,
                                    equipable_by_player   boolean      NOT NULL,
                                    equipable_weapon      boolean      NOT NULL,
                                    cost                  INTEGER      NOT NULL,
                                    lowalch               INTEGER,
                                    highalch              INTEGER,
                                    weight                FLOAT,
                                    buy_limit             INTEGER,
                                    quest_item            boolean      NOT NULL,
                                    release_date          VARCHAR(255),
                                    duplicate             boolean      NOT NULL,
                                    examine               VARCHAR(2000),
                                    icon                  VARCHAR(2580) NOT NULL,
                                    wiki_name             VARCHAR(255),
                                    wiki_url              VARCHAR(255),
                                    equipment             json,
                                    weapon                json
                                );`;

        try {
            this.client.query (createItemsTable);
        } catch (e) {
            console.log (e);
        }
    }

    public readItems () {
        let dir = './docs/items-json/';
        fs.readdir (dir, (err, files) => {
           if (err) {
               console.log('Error loading dir')
               return;
           }

           files.forEach((fileName) => {

               let data = fs.readFileSync (dir + fileName, { encoding: 'utf-8' }) ;

               this.handleItem (data);
           });

           console.log('total: ' + files.length)
        });
    }

    public async handleItem (data: string) {
        if (!this.client) {
            return;
        }

        let item: OSRSItem;
        try {
            item = JSON.parse (data);

            item.name = this.escapeString(item.name);
            item.last_updated = this.escapeString(item.last_updated);
            item.release_date = item.release_date ? this.escapeString(item.release_date) : null;
            item.icon = this.escapeString(item.icon);
            item.examine = item.examine ? this.escapeString(item.examine) : null;
            item.wiki_name = item.wiki_name ? this.escapeString(item.wiki_name) : null;
            item.wiki_url = item.wiki_url ? this.escapeString(item.wiki_url) : null;
        } catch (e) {
            console.log('failed to parse item json');
            return;
        }

        let itemInsert = `
            INSERT INTO hephaestus.items
            ( id, name, last_updated, incomplete, members, tradeable, tradeable_on_ge, stackable, stacked, noted, noteable, linked_id_item, linked_id_noted
            , linked_id_placeholder, placeholder, equipable, equipable_by_player, equipable_weapon, cost, lowalch, highalch, weight, buy_limit, quest_item
            , release_date, duplicate, examine, icon, wiki_name, wiki_url, equipment, weapon)
            VALUES ( ${item.id}, '${item.name}', '${item.last_updated}', ${item.incomplete}, ${item.members}, ${item.tradeable}, ${item.tradeable_on_ge}
                   , ${item.stackable}, ${item.stacked}, ${item.noted}, ${item.noteable}, ${item.linked_id_item}, ${item.linked_id_noted}
                   , ${item.linked_id_placeholder}, ${item.placeholder}, ${item.equipable}, ${item.equipable_by_player}, ${item.equipable_weapon}
                   , ${item.cost}, ${item.lowalch}, ${item.highalch}, ${item.weight}, ${item.buy_limit}, ${item.quest_item}, '${item.release_date}'
                   , ${item.duplicate}, '${item.examine}', '${item.icon}', '${item.wiki_name}', '${item.wiki_url}', '${JSON.stringify(item.equipment)}', '${JSON.stringify(item.weapon)}');
        `;

        try {
            await this.client.query(itemInsert);
            this.current++;
            console.log(this.current);
        } catch (e){
            console.log(`failed to insert item ${item.id}`, item, e);
        }
    }

    current = 0;

    private escapeString (s: string): string {
        s = s.replace(/'/g, "''");
        return s;
    }
}