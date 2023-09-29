import voluptuous as vol
import os
import json
import asyncio
import random
import logging

PRESETS_JSON_FILE = os.path.join(os.path.dirname(__file__), "./presets.json")

with open(PRESETS_JSON_FILE, "r") as file:
    SCENES_DATA = json.load(file)

_LOGGER = logging.getLogger(__name__)

async def apply_preset(hass, preset_id, light_entity_ids, transition, shuffle, brightness_override=None):
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

    if shuffle:
        random.shuffle(light_entity_ids)

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