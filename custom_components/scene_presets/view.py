from .const import NAME, DOMAIN, PANEL_URL
from .file_utils import VERSION, PRESET_DATA, BASE_PATH


async def async_setup_view(hass):
    hass.http.register_static_path(
        PANEL_URL,
        hass.config.path(f'{BASE_PATH}/frontend/scene_presets_panel.js'),
    )

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


async def bind_preset_images(hass):
    for preset in PRESET_DATA.get("presets", []):
        img_filename = preset.get("img")

        if img_filename is not None:
            hass.http.register_static_path(
                f'/assets/{DOMAIN}/{img_filename}',
                hass.config.path(f"{BASE_PATH}/assets/{img_filename}"),
            )