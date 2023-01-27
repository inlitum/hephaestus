import { Hermes }         from './hermes/hermes';

export function Routes () {
    Hermes.registerRoute('inventory.create', 'InventoryController.create');
    Hermes.registerRoute('inventory.read', 'InventoryController.read');
    Hermes.registerRoute('inventory.update', 'InventoryController.update');
    Hermes.registerRoute('inventory.delete', 'InventoryController.delete');
}
