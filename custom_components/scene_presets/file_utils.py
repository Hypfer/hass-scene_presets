import json
import os
import logging

_LOGGER = logging.getLogger(__name__)

BASE_PATH = os.path.dirname(os.path.realpath(__file__))
MANIFEST = json.load(
    open(os.path.join(BASE_PATH, 'manifest.json'))
)
VERSION = MANIFEST['version']



os.makedirs(os.path.join(BASE_PATH, 'userdata/custom/assets'), exist_ok=True)

PRESET_DATA = json.load(
    open(os.path.join(BASE_PATH, 'presets.json'))
)

custom_presets_path = os.path.join(BASE_PATH, 'userdata/custom/presets.json')
CUSTOM_PRESETS = None
if os.path.exists(custom_presets_path):
    try:
        with open(custom_presets_path, 'r') as file:
            CUSTOM_PRESETS = json.load(file)

        _LOGGER.info("Custom presets loaded successfully.")
    except json.JSONDecodeError as e:
        _LOGGER.error(f"Error loading custom presets: {e}")
else:
    _LOGGER.info(f"No custom presets file found at {custom_presets_path}")

if CUSTOM_PRESETS is not None:
    PRESET_DATA.get("presets", []).extend([{**d, 'custom': True} for d in CUSTOM_PRESETS.get("presets", [])])
    PRESET_DATA.get("categories", []).extend([{**d, 'custom': True} for d in CUSTOM_PRESETS.get("categories", [])])
