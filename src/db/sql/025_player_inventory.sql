CREATE TABLE IF NOT EXISTS hephaestus.player_inventory
(
    slot_id    integer not null,
    player_id  integer,
    item_id    integer,
    stack_size integer,
    PRIMARY KEY (slot_id, player_id),
    FOREIGN KEY (slot_id) REFERENCES hephaestus.inventory_slots (slot_id),
    FOREIGN KEY (player_id) REFERENCES hephaestus.players (player_id),
    FOREIGN KEY (item_id) REFERENCES hephaestus.items (id)
);