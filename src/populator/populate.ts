import { Client } from 'pg';
import * as fs    from 'fs';

export class Populate {
    client: Client | null = null;

    public constructor () {
        let host = process.env.PG_HOST ?? 'localhost';
        let port = Number.parseInt(process.env.PG_PORT ?? '');
        let username = process.env.PG_USERNAME ?? 'postgres';
        let password = process.env.PG_PASSWORD ?? '';
        let database = process.env.PG_DATABASE ?? 'postgres';

        if (!port || isNaN(port)) {
            port = 5432;
        }

        this.client = new Client ({ host: host, port: port, user: username, password: password, database: database });
        this.client.connect ().then (() => {
                this.initSchema ().then (() => {
                    this.initTables ().then (() => {
                        this.readItems ();
                        // this.client?.end();
                    });
                });
            }
        );


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

export interface OSRSItem {
    id: number; //Unique OSRS item ID number.
    name: string; //The name of the item.
    last_updated: string; //The last time (UTC) the item was updated (in ISO8601 date format).
    incomplete: boolean; //If the item has incomplete wiki data.
    members: boolean; //If the item is a members-only.
    tradeable: boolean; //If the item is tradeable (between players and on the GE).
    tradeable_on_ge: boolean; //If the item is tradeable (only on GE).
    stackable: boolean; //If the item is stackable (in inventory).
    stacked: number | null; //If the item is stacked, indicated by the stack count.
    noted: boolean; //If the item is noted.
    noteable: boolean; //If the item is noteable.
    linked_id_item: number | null; //The linked ID of the actual item (if noted/placeholder).
    linked_id_noted: number | null; //The linked ID of an item in noted form.
    linked_id_placeholder: number | null; //The linked ID of an item in placeholder form.
    placeholder: boolean; //If the item is a placeholder.
    equipable: boolean; //If the item is equipable (based on right-click menu entry).
    equipable_by_player: boolean; //If the item is equipable in-game by a player.
    equipable_weapon: boolean; //If the item is an equipable weapon.
    cost: number; //The store price of an item.
    lowalch: number | null; //The low alchemy value of the item (cost * 0.4).
    highalch: number | null; //The high alchemy value of the item (cost * 0.6).
    weight: number | null; //The weight (in kilograms) of the item.
    buy_limit: number | null; //The Grand Exchange buy limit of the item.
    quest_item: boolean; //If the item is associated with a quest.
    release_date: string | null; //Date the item was released (in ISO8601 format).
    duplicate: boolean; //If the item is a duplicate.
    examine: string | null; //The examine text for the item.
    icon: string; //The item icon (in base64 encoding).
    wiki_name: string | null; //The OSRS Wiki name for the item.
    wiki_url: string | null; //The OSRS Wiki URL (possibly including anchor link).
    equipment: OSRSEquipment | null; //The equipment bonuses of equipable armour/weapons.
    weapon: OSRSWeapon | null; //The weapon bonuses including attack speed, type and stance.
}

export interface OSRSEquipment {
    attack_stab: number; // The attack stab bonus of the item.
    attack_slash: number; // The attack slash bonus of the item.
    attack_crush: number; // The attack crush bonus of the item.
    attack_magic: number; // The attack magic bonus of the item.
    attack_ranged: number; // The attack ranged bonus of the item.
    defence_stab: number; // The defence stab bonus of the item.
    defence_slash: number; // The defence slash bonus of the item.
    defence_crush: number; // The defence crush bonus of the item.
    defence_magic: number; // The defence magic bonus of the item.
    defence_ranged: number; // The defence ranged bonus of the item.
    melee_strength: number; // The melee strength bonus of the item.
    ranged_strength: number; // The ranged strength bonus of the item.
    magic_damage: number; // The magic damage bonus of the item.
    prayer: number; // The prayer bonus of the item.
    slot: string; // The equipment slot associated with the item (e.g., head).
    requirements: OSRSRequirement | null; // An object of requirements {skill: level}.
}

export interface OSRSWeapon {
    attack_speed: number; // The attack speed of a weapon (in game ticks).
    weapon_type: string; // The weapon classification (e.g., axes)
    stances: {}[]; // An array of weapon stance information.
}

export interface OSRSStance {
    combat_style: 'deflect'
    attack_type: 'slash',
    attack_style: 'defensive',
    experience: 'defence',
    boosts: null
}

export interface OSRSRequirement {
    attack?: number,
    strength?: number,
    defence?: number,
    ranged?: number,
    prayer?: number,
    magic?: number,
    runecraft?: number,
    hitPoints?: number,
    crafting?: number,
    mining?: number,
    smithing?: number,
    fishing?: number,
    cooking?: number,
    fireMaking?: number,
    woodcutting?: number,
    agility?: number,
    herblore?: number,
    thieving?: number,
    fletching?: number,
    slayer?: number,
    farming?: number,
    construction?: number,
    hunter?: number
}