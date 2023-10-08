// @ts-nocheck
// noinspection JSUnusedGlobalSymbols

import {Container} from "react-dom";
import {App} from "./App";
import {createRoot, Root} from "react-dom/client";
import {loadConfigDashboard} from "./helpers";

class ScenePresetsPanel extends HTMLElement {
    initialized: boolean = false;
    shadow: Container;
    hasHass: boolean = false;
    _hass: any;
    private _narrow: boolean = false;
    private root: Root;

    constructor() {
        super();
        this.shadow = this.attachShadow({mode: "open"});
        
        this.root = createRoot(this.shadow);

        this.initialize().then(() => {
            console.log("loaded");
            
            this.initialized = true;
        })
    }

    set hass(hass) {
        this._hass = hass;

        //console.log("HASS was set", hass);

        this.renderElement();
    }

    set narrow(narrow) {
        this._narrow = narrow;

        this.renderElement();
    }

    renderElement() {
        if (this.initialized) {
            this.root.render(
                <App
                    hass={this._hass}
                    narrow={this._narrow}
                />
            );
        } else {
            setTimeout(() => {
                this.renderElement();
            }, 100);
        }
    }

    async initialize() {
        await loadConfigDashboard()
    }
}

export default ScenePresetsPanel;
