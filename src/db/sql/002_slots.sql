CREATE TABLE IF NOT EXISTS hephaestus.inventory_slots (
    slot_id serial primary key,
    row_index integer not null,
    column_index integer not null
);

INSERT INTO hephaestus.inventory_slots (row_index, column_index)
VALUES (0, 0), (0, 1), (0, 2), (0, 3),
       (1, 0), (1, 1), (1, 2), (1, 3),
       (2, 0), (2, 1), (2, 2), (2, 3),
       (3, 0), (3, 1), (3, 2), (3, 3),
       (4, 0), (4, 1), (4, 2), (4, 3),
       (5, 0), (5, 1), (5, 2), (5, 3),
       (6, 0), (6, 1), (6, 2), (6, 3);
