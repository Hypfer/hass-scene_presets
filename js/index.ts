import ScenePresetsPanel from "./ScenePresetsPanel";

const ELEMENT_NAME = "scene-presets-panel";

if (!window.customElements.get(ELEMENT_NAME)) {
    window.customElements.define(ELEMENT_NAME, ScenePresetsPanel);
}
