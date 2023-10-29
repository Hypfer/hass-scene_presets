import voluptuous as vol
import asyncio
import logging
from .file_utils import PRESET_DATA
from .color_management import *

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

    preset_colors = [(light["x"], light["y"]) for light in scene_data["lights"]]

    if shuffle:
        random.shuffle(light_entity_ids)

    tasks = []

    # Apply the scene to the selected light entities
    for index, entity_id in enumerate(light_entity_ids):
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

        if shuffle:
            current_color = hass_state.attributes.get("xy_color", None)

            if current_color is not None:
                next_color = get_next_random_color(current_color, preset_colors)
            else:
                next_color = get_random_color(preset_colors)
        else:
            next_color = get_next_color(index, preset_colors)

        supported_color_modes = hass_state.attributes.get("supported_color_modes", "")
        color_support = any(mode in supported_color_modes for mode in ["xy", "hs", "rgb"])
        temp_support = "color_temp" in supported_color_modes

        if color_support:
            light_params["xy_color"] = next_color
        elif temp_support:
            # if light does not support xy colors, convert to kelvin
            x_color = next_color[0]
            y_color = next_color[1]

            n = (x_color - 0.3320) / (0.1858 - y_color)
            color_temp_kelvin = int(437 * n**3 + 3601 * n**2 + 6861 * n + 5517)

            light_params["kelvin"] = color_temp_kelvin
        else:
            continue

        task = hass.services.async_call(
            "light",
            "turn_on",
            light_params,
            blocking=False,
        )
        tasks.append(task)

    await asyncio.gather(*tasks)
