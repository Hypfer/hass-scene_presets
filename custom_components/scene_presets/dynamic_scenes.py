import uuid
import asyncio
import logging
from .presets import apply_preset
from .const import *

_LOGGER = logging.getLogger(__name__)


class DynamicScene:
    def __init__(self, hass, parameters=None, interval=5):
        self.id = str(uuid.uuid4())
        self.hass = hass
        self.interval = interval
        self._running = False
        self._task = None
        self.parameters = parameters if parameters is not None else {}
        
        self.start_loop()

    async def _loop(self):
        run_count = 0

        while self._running:
            # make sure to abort when (all) the light(s) turns off
            if run_count > 0:
                entity_states = [
                    self.hass.states.get(x)
                    for x in self.parameters.get("light_entity_ids")
                    if x is not None
                ]
                lights_on = len([x for x in entity_states if x.state == "on"])
                if lights_on == 0:
                    _LOGGER.warning("Stop running because light(s) have turned off")
                    self._running = False
                    return

            transition = self.parameters.get(ATTR_TRANSITION)
            smart_shuffle = True

            # on start of the dynamic scene, the user wants quicker transitions + all colors available in the preset
            if run_count == 0:
                transition = 0.5
                smart_shuffle = False


            await apply_preset(
                self.hass,
                self.parameters.get(ATTR_SCENE_PRESET_ID),
                self.parameters.get("light_entity_ids"),
                transition,
                self.parameters.get(ATTR_SHUFFLE),
                smart_shuffle,
                self.parameters.get(ATTR_BRIGHTNESS, None),
            )
            run_count += 1

            await asyncio.sleep(self.interval)

    def start_loop(self):
        if self._running:
            return  # Already running
        self._running = True
        self._task = self.hass.create_task(self._loop())

    def stop_loop(self):
        if self._task:
            self._task.cancel()

        self._running = False

    def to_dict(self):
        return {
            "id": self.id,
            "interval": self.interval,
            "parameters": self.parameters,
            "running": self._running,
        }

    def __del__(self):
        self.stop_loop()


class DynamicSceneManager:
    def __init__(self):
        self.dynamic_scenes = {}

    def create_new(self, hass, parameters=None, interval=None):
        scene = DynamicScene(hass, parameters, interval)
        self.dynamic_scenes[scene.id] = scene

        return scene.to_dict()

    def get_by_id(self, id):
        return self.dynamic_scenes.get(id)

    def delete_by_id(self, id):
        active_scene = self.dynamic_scenes.get(id)

        if active_scene:
            active_scene.stop_loop()
            del self.dynamic_scenes[id]

    def stop_all(self):
        scenes_to_delete = []

        for scene in self.dynamic_scenes.values():
            scene.stop_loop()
            scenes_to_delete.append(scene.id)

        for scene_id in scenes_to_delete:
            del self.dynamic_scenes[scene_id]

    def stop_all_for_entity_id(self, entity_id):
        scenes_to_delete = []

        for scene in self.dynamic_scenes.values():
            entity_ids = scene.parameters.get("light_entity_ids", [])
            if entity_id in entity_ids:
                scene.stop_loop()
                scenes_to_delete.append(scene.id)

        for scene_id in scenes_to_delete:
            del self.dynamic_scenes[scene_id]

    def get_all(self):
        return list(self.dynamic_scenes.values())

    def get_all_as_dict(self):
        scenes_dict = {"dynamic_scenes": []}

        for scene in self.dynamic_scenes.values():
            scenes_dict["dynamic_scenes"].append(scene.to_dict())

        return scenes_dict
