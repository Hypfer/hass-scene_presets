# Scene Presets

This custom_component is an implementation of an idea not all too dissimilar to what the Philips Hue app calls Scenes.
Apart from that though, it has nothing to do with Hue. No bridge required.

Everything has been implemented entirely inside this custom_component, meaning that it works with every `light` entity.
No vendor restrictions. No need for special bridges.
And, most importantly, no account required :-)

For now, installation is done by setting up this repo as a HACS custom repository.<br/>
After the install via HACS, you must then set it up via a config flow that does nothing. 👍

## Usage

For basic usage, open the Home Assistant sidebar, navigate to "Scene Presets", select your lights and then click on a preset image to apply it.

For advanced usage, use the Home Assistant DevTools and call the services provided by the custom_component directly.
Preset IDs can be found in the overview here: [assets](./custom_components/scene_presets/assets/Readme.md)

## Screenshots

![ui.png](./img/ui.png)

![service.png](./img/service.png)

![step1.png](./img/step1.png)

![step2.png](./img/step2.png)


## Presets

This component provides all the scene presets that were available in the Hue App scene gallery on 2023-09-28.
These have been manually extracted in a clean-room way by setting a group of lights to a scene and then noting the different x,y values + its name.
Thanks again to @coderph0x!

Check out the [assets](./custom_components/scene_presets/assets/Readme.md) folder for a list with all presets available.