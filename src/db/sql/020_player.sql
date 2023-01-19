CREATE TABLE IF NOT EXISTS hephaestus.players
(
    player_id    serial PRIMARY KEY,
    name         varchar,
    password     varchar,
    member       boolean,
    created_date date default now(),
    time_played  date
);