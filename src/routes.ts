import { Hermes }         from './hermes/hermes';

export function Routes () {
    Hermes.registerRoute('inventory.create', 'InventoryController.query');
}
