// @ts-nocheck
import {Container, render} from "react-dom";
import {App} from "./App";

class ScenePresetsPanel extends HTMLElement {
    shadow: Container | null;
    hasHass: boolean = false;
    _hass: any;

    constructor() {
        super();

        this.shadow = this.attachShadow({mode: "open"});
    }

    set hass(hass) {
        this._hass = hass;

        console.log("HASS was set");
        if (!this.hasHass) {
            this.hasHass = true;

            this.renderElement();
        }
    }

    renderElement() {
        console.log("HASS", this._hass);

        render(<App hass={this._hass} />, this.shadow);
    }
}

export default ScenePresetsPanel;
