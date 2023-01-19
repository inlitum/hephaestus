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