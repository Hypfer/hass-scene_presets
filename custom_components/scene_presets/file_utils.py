import json
import os

BASE_PATH = os.path.dirname(os.path.realpath(__file__))

MANIFEST = json.load(
    open(os.path.join(BASE_PATH, 'manifest.json'))
)
VERSION = MANIFEST['version']

PRESET_DATA = json.load(
    open(os.path.join(BASE_PATH, 'presets.json'))
)




