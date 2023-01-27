CREATE OR REPLACE FUNCTION hephaestus.set_player_inventory_slot(_player_id INTEGER, _item_id INTEGER, _stack_size INTEGER, _row_id INTEGER, _column_id INTEGER)
    RETURNS VARCHAR
    LANGUAGE plpgsql
AS
$$
DECLARE
    _slot_id INTEGER;
BEGIN
    SELECT s.slot_id
    INTO
        _slot_id
    FROM hephaestus.inventory_slots s
    WHERE s.row_index = _row_id
      AND s.column_index = _column_id;

    IF _slot_id IS NULL THEN
        RETURN 'Slot not set';
    END IF;

    IF EXISTS(SELECT true FROM hephaestus.player_inventory pi WHERE pi.slot_id = _slot_id AND pi.player_id = _player_id) THEN
        UPDATE hephaestus.player_inventory
        SET item_id    = _item_id,
            stack_size = _stack_size
        WHERE player_id = _player_id
          AND slot_id = _slot_id;

        RETURN 'Slot set';
    ELSE
        INSERT INTO hephaestus.player_inventory (slot_id, player_id, item_id, stack_size)
        VALUES (_slot_id, _player_id, _item_id, _stack_size);

        RETURN 'Slot set';
    END IF;
END;
$$