import voluptuous as vol
import asyncio
import random
import logging
from .file_utils import PRESET_DATA

_LOGGER = logging.getLogger(__name__)


async def apply_preset(
    hass, preset_id, light_entity_ids, transition, shuffle, brightness_override=None
):
    # Retrieve the scene data by ID (if found)
    scene_data = None
    for scene_set in PRESET_DATA.get("sets", []):
        for scene in scene_set.get("scenes", []):
            if scene.get("name") == preset_id:
                scene_data = scene
                break
        if scene_data:
            break

    if not scene_data:
        raise vol.Invalid(f"Preset '{preset_id}' not found.")

    if shuffle:
        random.shuffle(light_entity_ids)

    tasks = []

    # Apply the scene to the selected light entities
    light_index = 0
    for entity_id in light_entity_ids:
        if light_index >= len(scene_data["lights"]):
            light_index = 0  # Start back at the beginning

        light_params = {
            "brightness": brightness_override
            if brightness_override
            else scene_data.get("bri", 255),
            "transition": transition,
            "entity_id": entity_id,
        }
        hass_state = hass.states.get(entity_id)
        if not hass_state:
            continue
        if "xy" in hass_state.attributes.get("supported_color_modes", ""):
            light_params["xy_color"] = [
                scene_data["lights"][light_index]["x"],
                scene_data["lights"][light_index]["y"],
            ]
        else:
            # if light does not support xy colors, convert to kelvin
            x_color = scene_data["lights"][light_index]["x"]
            y_color = scene_data["lights"][light_index]["y"]
            n = (x_color - 0.3320) / (0.1858 - y_color)
            color_temp_kelvin = int(437 * n**3 + 3601 * n**2 + 6861 * n + 5517)
            light_params["kelvin"] = color_temp_kelvin

        task = hass.services.async_call(
            "light",
            "turn_on",
            light_params,
            blocking=False,
        )
        tasks.append(task)

        light_index += 1

    await asyncio.gather(*tasks)
