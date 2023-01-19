import { InventoryController } from './inventory-controller';
import { error }                               from 'winston';

const controllers = {
    InventoryController: () => {
        return new InventoryController ();
    }
};

export default function generateControllerFromName (name: string): Object {
    // @ts-ignore
    if (!controllers || controllers[ name ] == null) {
        throw error ('invalid');
    }

    // @ts-ignore
    return controllers[ name ] ();
}