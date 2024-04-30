from homeassistant.helpers import entity_registry, device_registry, area_registry

def ensure_list(data):
    if isinstance(data, list):
        data = data
    elif isinstance(data, str):
        data = [data]
    else:
        data = []

    return data


def resolve_targets(hass, entity_ids, device_ids, area_ids, floor_ids, label_ids):
    entity_reg = entity_registry.async_get(hass)
    device_reg = device_registry.async_get(hass)
    area_reg = area_registry.async_get(hass)

    resolved_entity_ids = []

    # Labels and floors are the new topmost layers, so we start with those
    for label_id in label_ids:
        device_entries = device_registry.async_entries_for_label(device_reg, label_id)
        device_ids.extend([entry.id for entry in device_entries])

        area_entries = area_registry.async_entries_for_label(area_reg, label_id)
        area_ids.extend([entry.id for entry in area_entries])

        entity_entries = entity_registry.async_entries_for_label(entity_reg, label_id)
        entity_ids.extend([entry.entity_id for entry in entity_entries])

    # Right now, floors only contain areas
    for floor_id in floor_ids:
        area_entries = area_registry.async_entries_for_floor(area_reg, floor_id)
        area_ids.extend([entry.id for entry in area_entries])

    # Areas either contain devices or entities directly
    for area_id in area_ids:
        device_entries = device_registry.async_entries_for_area(device_reg, area_id)
        device_ids.extend([entry.id for entry in device_entries])

        entity_entries = entity_registry.async_entries_for_area(entity_reg, area_id)
        entity_ids.extend([entry.entity_id for entry in entity_entries])

    # Devices only contain entities
    for device_id in device_ids:
        entity_entries = entity_registry.async_entries_for_device(entity_reg, device_id)
        entity_ids.extend([entry.entity_id for entry in entity_entries])

    # Iterate through all gathered entity IDs and try to recursively resolve them if they happen to be groups.
    # Also filters down to light entities only
    for entity_id in entity_ids:
        resolved_entity_ids.extend(resolve_entity_ids(hass, entity_id))

    # Deduplicate entity_ids
    resolved_entity_ids = list(set(resolved_entity_ids))

    return resolved_entity_ids

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

            if conf_entry is not None:
                if conf_entry.domain != "group":
                    # If the domain isn't "group", the entity is something unexpected (e.g. a lightener custom_component entity)
                    # Thus, we don't resolve them further as we can't make assumptions over the purpose of the entity
                    resolved_ids.append(entity_id)
                else:
                    # It's a group
                    # noinspection PySimplifyBooleanCheck
                    if conf_entry.options.get("hide_members", False) == False:
                        # If hide_members is not enabled, we assume that the user uses this group to just organize multiple things
                        # Therefore, we do resolve them further
                        for nested_entity_id in nested_entity_ids:
                            resolved_ids.extend(resolve_entity_ids(hass, nested_entity_id, depth + 1))
                    else:
                        # If hide_members is enabled, we assume that the user intended to have a single logical light
                        # consisting of multiple physical ones
                        # Consequently, we don't resolve further to not make a single fixture light up with different settings
                        resolved_ids.append(entity_id)
            else:
                # If there is no config entry (e.g. YAML-configured group), continue resolving further
                for nested_entity_id in nested_entity_ids:
                    resolved_ids.extend(resolve_entity_ids(hass, nested_entity_id, depth + 1))

    return resolved_ids


def get_config_entry(hass, entity_id):
    entity_reg = entity_registry.async_get(hass)

    if entity_reg_entry := entity_reg.async_get(entity_id):
        if conf_entry := hass.config_entries.async_get_entry(entity_reg_entry.config_entry_id):
            return conf_entry

    return None