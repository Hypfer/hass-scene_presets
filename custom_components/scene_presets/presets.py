import voluptuous as vol
import asyncio
import logging
from .file_utils import PRESET_DATA
from .color_management import *
from .color_temperature import find_closest_ct_match

_LOGGER = logging.getLogger(__name__)


async def apply_preset(
    hass,
    preset_id,
    light_entity_ids,
    transition,
    shuffle,
    smart_shuffle,
    brightness_override=None
):
    preset_data = None
    for preset in PRESET_DATA.get("presets", []):
        if preset.get("id") == preset_id:
            preset_data = preset
            break

    if not preset_data:
        raise vol.Invalid(f"Preset '{preset_id}' not found.")

    brightness = brightness_override if brightness_override else preset_data.get("bri", 255)

    preset_colors = [(light["x"], light["y"]) for light in preset_data["lights"]]

    randomized_colors = None
    if shuffle:
        randomized_colors = get_randomized_colors(preset_colors, len(light_entity_ids))
        random.shuffle(light_entity_ids) # While this _should_ be redundant, the result somehow feels better with it in place

    tasks = []

    for index, entity_id in enumerate(light_entity_ids):
        light_params = {
            "brightness": brightness,
            "transition": transition,
            "entity_id": entity_id,
        }
        hass_state = hass.states.get(entity_id)
        if not hass_state:
            continue

        if shuffle:
            current_color = hass_state.attributes.get("xy_color", None)

            if current_color is not None and smart_shuffle:
                next_color = get_next_smart_random_color(current_color, preset_colors)
            elif randomized_colors is not None and index < len(randomized_colors):
                next_color = randomized_colors[index]
            else:
                next_color = get_random_color(preset_colors)
        else:
            next_color = get_next_color(index, preset_colors)

        supported_color_modes = hass_state.attributes.get("supported_color_modes", "")
        color_support = any(mode in supported_color_modes for mode in ["xy", "hs", "rgb", "rgbw"])
        temp_support = "color_temp" in supported_color_modes
        brightness_support = "brightness" in supported_color_modes

        if color_support:
            light_params["xy_color"] = next_color
        elif temp_support:
            light_params["color_temp_kelvin"] = find_closest_ct_match(next_color[0], next_color[1])
        elif brightness_support:
            pass # Nothing to add to the payload. Brightness is already part of it
        else:
            continue # Not turning on the light since it neither supports color nor color temperature and not even dimming

        task = hass.services.async_call(
            "light",
            "turn_on",
            light_params,
            blocking=False,
        )
        tasks.append(task)

    await asyncio.gather(*tasks)
