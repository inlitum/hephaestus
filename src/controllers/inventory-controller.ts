import { Loggable } from '../lib/loggable';
import { Hive }     from '../db/hive';

export class InventoryController extends Loggable {

    public constructor () {
        super ('InventoryController');
    }

    public async create (data: {playerId: number, itemId: number, stackSize: number, row: number, column: number}) {
        const { playerId, itemId, stackSize, row, column } = data;
        const sql = `SELECT hephaestus.set_player_inventory_slot(${playerId}, ${itemId}, ${stackSize}, ${row}, ${column});`

        let s = await Hive.INSTANCE.sendQuery(sql);

        console.log(s)

        return 'test'
    }

    public read (data: any) {
        console.log(data)
    }

    public update (data: any) {
        console.log(data)
    }

    public delete (data: any) {
        console.log(data)
    }
}