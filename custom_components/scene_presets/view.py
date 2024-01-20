from .const import NAME, DOMAIN, PANEL_URL
from .file_utils import VERSION, PRESET_DATA, BASE_PATH
from homeassistant.components.http import HomeAssistantView

class ScenePresetDataView(HomeAssistantView):
    url = f'/assets/{DOMAIN}/scene_presets.json'
    name = f'assets:{DOMAIN}:preset_data'
    requires_auth = False

    async def get(self, request):
        return self.json(
            result=PRESET_DATA,
        )

async def async_setup_view(hass):
    hass.http.register_static_path(
        PANEL_URL,
        hass.config.path(f'{BASE_PATH}/frontend/scene_presets_panel.js'),
    )

    hass.http.register_view(ScenePresetDataView)

    await bind_preset_images(hass)

    hass.components.frontend.async_register_built_in_panel(
        component_name="custom",
        sidebar_title=NAME,
        sidebar_icon="mdi:track-light",
        frontend_url_path="scene_presets",
        require_admin=True,
        config={
            "_panel_custom": {
                "name": "scene-presets-panel",
                "module_url": f"{PANEL_URL}?{VERSION}"
            },
            "version": VERSION
        },
    )

async def async_remove_view(hass):
    hass.components.frontend.async_remove_panel("scene_presets")

async def bind_preset_images(hass):
    for preset in PRESET_DATA.get("presets", []):
        img_filename = preset.get("img")
        is_custom = preset.get("custom")

        if img_filename is not None:
            path = f"{BASE_PATH}/assets/{img_filename}"
            if is_custom is not None and is_custom:
                path = f"{BASE_PATH}/userdata/custom/assets/{img_filename}"

            hass.http.register_static_path(
                f'/assets/{DOMAIN}/{img_filename}',
                hass.config.path(path),
            )