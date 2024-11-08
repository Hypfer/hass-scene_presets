import logging
from homeassistant.helpers.entity import Entity
from .file_utils import PRESET_DATA
from .color_management import *
from .color_temperature import find_closest_ct_match

_LOGGER = logging.getLogger(__name__)

DOMAIN = 'scene_preset_integration'

async def async_setup(hass, config):
    """Set up the Scene Preset Integration."""
    # Erzeuge eine Entität für jedes Preset in den Daten
    for preset in PRESET_DATA.get("presets", []):
        preset_entity = PresetScene(
            hass,
            preset_id=preset.get("id"),
            name=preset.get("name"),
            brightness=preset.get("bri"),
            colors=[(light["x"], light["y"]) for light in preset["lights"]],
            transition=preset.get("transition", 1),  # Übergangsdauer für Presets, Standardwert 1 Sekunde
            interval=preset.get("interval", 0)  # Intervallzeit für die Farbwechsel, Standardwert 0
        )
        # Registrierung der Entität in Home Assistant
        hass.add_job(hass.helpers.discovery.async_load_platform, 'scene', DOMAIN, preset_entity, config)

    return True

class PresetScene(Entity):
    """Repräsentiert eine Preset als dynamische Entität."""

    def __init__(self, hass, preset_id, name, brightness, colors, transition=1, interval=0):
        """Initialisiert die Preset-Entität."""
        self.hass = hass
        self.preset_id = preset_id
        self._name = name
        self._brightness = brightness
        self._colors = colors
        self._transition = transition
        self._interval = interval
        self._state = False

    @property
    def name(self):
        """Erzeugt einen dynamischen Namen, der Parameter einschließt."""
        # Generiere den Namen entsprechend der Helligkeit, Übergangsdauer und Intervalldauer
        return f"scene.preset.{self._name}_bri{self._brightness}_tra{self._transition}_int{self._interval}"

    @property
    def is_on(self):
        """Zeigt den Zustand der Szene an."""
        return self._state

    async def async_turn_on(self, **kwargs):
        """Aktiviert die Szene und setzt die Beleuchtungsparameter."""
        self._state = True
        await apply_preset(
            self.hass,
            preset_id=self.preset_id,
            light_entity_ids=kwargs.get("entity_id", []),
            transition=self._transition,
            shuffle=False,
            smart_shuffle=False,
            brightness_override=self._brightness,
            interval=self._interval
        )

    async def async_turn_off(self, **kwargs):
        """Deaktiviert die Szene."""
        self._state = False
        # Optional: Definiere hier zusätzliche Aktionen beim Deaktivieren der Szene

async def apply_preset(
    hass,
    preset_id=None,
    light_entity_ids=None,
    transition=1,
    shuffle=False,
    smart_shuffle=False,
    brightness_override=None,
    interval=0
):
    preset_data = None

    # Suche das Preset basierend auf der übergebenen ID
    for preset in PRESET_DATA.get("presets", []):
        if preset.get("id") == preset_id:
            preset_data = preset
            break

    if not preset_data:
        _LOGGER.error(f"Preset '{preset_id}' nicht gefunden.")
        return

    brightness = brightness_override if brightness_override else preset_data.get("bri", 255)
    preset_colors = [(light["x"], light["y"]) for light in preset_data["lights"]]

    tasks = []
    for index, entity_id in enumerate(light_entity_ids):
        light_params = {
            "brightness": brightness,
            "transition": transition,
            "entity_id": entity_id,
        }

        next_color = get_next_color(index, preset_colors, interval)
        light_params["xy_color"] = next_color

        task = hass.services.async_call("light", "turn_on", light_params, blocking=False)
        tasks.append(task)

    await asyncio.gather(*tasks)

def get_next_color(index, colors, interval):
    """Bestimmt die nächste Farbe unter Berücksichtigung des Intervalls für Farbübergänge."""
    if interval > 0:
        return colors[(index + interval) % len(colors)]
    return colors[index % len(colors]
