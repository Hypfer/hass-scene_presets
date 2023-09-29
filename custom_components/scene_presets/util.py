from homeassistant.components.group import expand_entity_ids
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

    for entity_id in entity_ids:
        if entity_id.startswith("light."):
            resolved_entity_ids.extend([entity_id])
        elif entity_id.startswith("group."):
            resolved_entity_ids.extend(expand_entity_ids(hass, [entity_id]))

    for device_id in device_ids:
        registry_entries = entity_registry.async_entries_for_device(entity_reg, device_id)

        resolved_entity_ids.extend(entry.entity_id for entry in registry_entries if entry.domain == 'light')
    for area_id in area_ids:
        device_entries = device_registry.async_entries_for_area(device_reg, area_id)

        for device_entry in device_entries:
            registry_entries = entity_registry.async_entries_for_device(entity_reg, device_entry.id)

            resolved_entity_ids.extend(entry.entity_id for entry in registry_entries if entry.domain == 'light')

    # Deduplicate entity_id list
    resolved_entity_ids = list(set(resolved_entity_ids))

    # Filter resolved_entity_ids to include only light entities
    light_entity_ids = [entity_id for entity_id in resolved_entity_ids if entity_id.startswith("light.")]

    return light_entity_ids