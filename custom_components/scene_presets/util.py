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


    entity_ids_to_process = set(entity_ids)
    device_ids_to_process = set(device_ids)
    area_ids_to_process = set(area_ids)

    # 1. Process labels: can yield entities, devices, or areas
    for label_id in label_ids:
        for entry in entity_registry.async_entries_for_label(entity_reg, label_id):
            entity_ids_to_process.add(entry.entity_id)
        for entry in device_registry.async_entries_for_label(device_reg, label_id):
            device_ids_to_process.add(entry.id)
        for entry in area_registry.async_entries_for_label(area_reg, label_id):
            area_ids_to_process.add(entry.id)

    # 2. Process floors: can yield areas
    for floor_id in floor_ids:
        for entry in area_registry.async_entries_for_floor(area_reg, floor_id):
            area_ids_to_process.add(entry.id)

    # 3. Process areas: can yield devices or entities
    for area_id in area_ids_to_process:
        # 3.1 Add entities directly assigned to this area
        for entity in entity_registry.async_entries_for_area(entity_reg, area_id):
            entity_ids_to_process.add(entity.entity_id)

        # 3.2 Process devices of areas here, as entities of devices may not be part of the same area the device is in
        #     Only here do we know that the parent device was only referenced by an area + _which_ area it was
        for device in device_registry.async_entries_for_area(device_reg, area_id):
            for entity in entity_registry.async_entries_for_device(entity_reg, device.id):
                # Skip any device entities that are in a different area than their parent device
                if entity.area_id is None or entity.area_id == area_id:
                    entity_ids_to_process.add(entity.entity_id)

    # 4. Process explicitly targeted devices: can yield entities
    for device_id in device_ids_to_process:
        for entity in entity_registry.async_entries_for_device(entity_reg, device_id):
            entity_ids_to_process.add(entity.entity_id)

    # 5. Process entities: can yield even more entities
    #    This resolves any groups and also filters down to light entities only
    resolved_entity_ids = []
    for entity_id in entity_ids_to_process:
        resolved_entity_ids.extend(resolve_entity_ids(hass, entity_id))

    # 6. Deduplicate all resolved entity_ids
    #    This is required, because we may have resolved multiple groups that share one or more members
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
