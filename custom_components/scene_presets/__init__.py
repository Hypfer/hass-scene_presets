import voluptuous as vol
import os
import homeassistant.helpers.config_validation as cv
import json
import logging
from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers import entity_registry
from homeassistant.helpers import device_registry
from homeassistant.components.group import expand_entity_ids
from .const import DOMAIN
import asyncio
import random


SERVICE_APPLY_PRESET = "apply_preset"
ATTR_SCENE_PRESET_ID = "preset_id"
ATTR_TARGETS = "targets"
ATTR_BRIGHTNESS = "brightness"
ATTR_TRANSITION = "transition"
ATTR_SHUFFLE = "shuffle"
PRESETS_JSON_FILE = os.path.join(os.path.dirname(__file__), "./presets.json")

with open(PRESETS_JSON_FILE, "r") as file:
    SCENES_DATA = json.load(file)

SCENE_SCHEMA = vol.Schema({
    vol.Required(ATTR_SCENE_PRESET_ID): cv.string,
    vol.Required(ATTR_TARGETS): vol.Any(dict),
    vol.Optional(ATTR_BRIGHTNESS): vol.Coerce(int),
    vol.Optional(ATTR_TRANSITION, default=1): vol.Coerce(int),
    vol.Optional(ATTR_SHUFFLE, default=False): cv.boolean
})


_LOGGER = logging.getLogger(__name__)


def ensure_list(data):
    if isinstance(data, list):
        data = data
    elif isinstance(data, str):
        data = [data]
    else:
        data = []

    return data

async def async_setup(hass, config):
    async def apply_preset_service(call):
        preset_id = call.data.get(ATTR_SCENE_PRESET_ID)
        targets = call.data.get(ATTR_TARGETS)
        brightness_override = call.data.get(ATTR_BRIGHTNESS)
        transition = call.data.get(ATTR_TRANSITION, 1)
        shuffle = call.data.get(ATTR_SHUFFLE, False)

        # Retrieve the scene data by ID (if found)
        scene_data = None
        for scene_set in SCENES_DATA.get("sets", []):
            for scene in scene_set.get("scenes", []):
                if scene.get("name") == preset_id:
                    scene_data = scene
                    break
            if scene_data:
                break

        if not scene_data:
            raise vol.Invalid(f"Preset '{preset_id}' not found.")

        entity_reg = entity_registry.async_get(hass)
        device_reg = device_registry.async_get(hass)

        resolved_entity_ids = []

        entity_ids = ensure_list(targets.get("entity_id"))
        device_ids = ensure_list(targets.get("device_id"))
        area_ids = ensure_list(targets.get("area_id"))

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

        if shuffle:
            random.shuffle(resolved_entity_ids)

        # Filter resolved_entity_ids to include only light entities
        light_entity_ids = [entity_id for entity_id in resolved_entity_ids if entity_id.startswith("light.")]

        tasks = []

        # Apply the scene to the selected light entities
        light_index = 0
        for entity_id in light_entity_ids:
            if light_index >= len(scene_data["lights"]):
                light_index = 0  # Start back at the beginning

            light_params = {
                "xy_color": [
                    scene_data["lights"][light_index]["x"],
                    scene_data["lights"][light_index]["y"]
                ],
                "brightness": brightness_override if brightness_override is not None else scene_data.get("bri", 255),
                "transition": transition,
            }

            task = hass.services.async_call(
                "light",
                "turn_on",
                {
                    "entity_id": entity_id,
                    "xy_color": light_params["xy_color"],
                    "brightness": light_params["brightness"],
                    "transition": light_params["transition"],
                },
                blocking=False,
            )
            tasks.append(task)

            light_index += 1

        await asyncio.gather(*tasks)

    hass.services.async_register(
        DOMAIN,
        SERVICE_APPLY_PRESET,
        apply_preset_service,
        schema=SCENE_SCHEMA,
    )

    return True

async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry
) -> bool:
    hass.data.setdefault(DOMAIN, {})

    return True
