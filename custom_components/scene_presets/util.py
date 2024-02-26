from homeassistant.helpers import entity_registry, device_registry

def ensure_list(data):
    if isinstance(data, list):
        data = data
    elif isinstance(data, str):
        data = [data]
    else:
        data = []

    return data


def resolve_targets(hass, entity_ids, device_ids, area_ids):
    entity_reg = entity_registry.async_get(hass)
    device_reg = device_registry.async_get(hass)

    resolved_entity_ids = []

    # First we have to resolve areas since they may contain lights, groups or groups that pretend to be lights
    for area_id in area_ids:
        device_entries = device_registry.async_entries_for_area(device_reg, area_id)

        for device_entry in device_entries:
            registry_entries = entity_registry.async_entries_for_device(entity_reg, device_entry.id)

            resolved_entity_ids.extend(entry.entity_id for entry in registry_entries if entry.domain == 'light' or entry.domain == 'group')

    # Then we take all entity IDs, try to figure out if they're lights, groups or groups posing as lights and resolve them down to plain lights
    for entity_id in entity_ids:
        resolved_entity_ids.extend(resolve_entity_ids(hass, entity_id))

    # Finally, Devices can be resolved last, because they should never provide groups and thus should only ever contain plain light entities
    for device_id in device_ids:
        registry_entries = entity_registry.async_entries_for_device(entity_reg, device_id)

        resolved_entity_ids.extend(entry.entity_id for entry in registry_entries if entry.domain == 'light')

    # Deduplicate entity_id list
    resolved_entity_ids = list(set(resolved_entity_ids))

    # Filter resolved_entity_ids to include only light entities
    light_entity_ids = [entity_id for entity_id in resolved_entity_ids if entity_id.startswith("light.")]

    return light_entity_ids


def resolve_entity_ids(hass, entity_id, depth=0):
    resolved_ids = []

    if not entity_id.startswith(("light", "group")):
        return resolved_ids

    # If you have groups nested 4+ layers deep, you should rethink your life choices
    if depth > 4:
        return resolved_ids

    if entity := hass.states.get(entity_id):
        nested_entity_ids = entity.attributes.get("entity_id", [])

        if not nested_entity_ids: # It's just a plain old light
            resolved_ids.append(entity_id)

        else: # It's a group possibly pretending to be a light
            conf_entry = get_config_entry(hass, entity_id)

            if conf_entry is not None and conf_entry.options.get("hide_members", False):
                # Assume that by enabling hide_members, the user intended to have a single logical light consisting of multiple physical ones
                # => Don't resolve further to not make a single fixture light up with different settings
                resolved_ids.append(entity_id)
            else:
                for nested_entity_id in nested_entity_ids:
                    # Assume that by not hiding the individual members, the user uses this group to organize multiple things
                    # => Resolve further until we've arrived at the individual light entities
                    resolved_ids.extend(resolve_entity_ids(hass, nested_entity_id, depth + 1))

    return resolved_ids


def get_config_entry(hass, entity_id):
    entity_reg = entity_registry.async_get(hass)

    if entity_reg_entry := entity_reg.async_get(entity_id):
        if conf_entry := hass.config_entries.async_get_entry(entity_reg_entry.config_entry_id):
            return conf_entry

    return None