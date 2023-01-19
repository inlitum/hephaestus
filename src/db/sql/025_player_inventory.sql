CREATE TABLE IF NOT EXISTS hephaestus.player_inventory
(
    item_id    integer PRIMARY KEY,
    stack_size integer,
    row        integer,
    column     integer
);