// @ts-nocheck
import {Container} from "react-dom";
import {App} from "./App";
import {createRoot, Root} from "react-dom/client";
import {DEFAULT_STYLES} from "./const";

class ScenePresetsPanel extends HTMLElement {
    shadow: Container;
    hasHass: boolean = false;
    _hass: any;
    private _narrow: boolean = false;
    private readonly styleElem: HTMLStyleElement;
    private readonly container: HTMLDivElement;
    private root: Root;

    constructor() {
        super();
        this.shadow = this.attachShadow({mode: "open"});

        this.container = document.createElement("div");
        this.styleElem = document.createElement("style");

        this.shadow.appendChild(this.styleElem);
        this.shadow.appendChild(this.container);
        
        Object.entries(DEFAULT_STYLES).forEach(([key, value]) => {
            this.container.style.setProperty(key, value);
        });

        this.root = createRoot(this.container);
    }

    set hass(hass) {
        this._hass = hass;

        console.log("HASS was set", hass);
        if (!this.hasHass) {
            this.hasHass = true;

            this.renderElement();
        }
    }

    set narrow(narrow) {
        this._narrow = narrow;

        this.renderElement();
    }

    renderElement() {
        console.log("HASS", this._hass);

        this.syncCSSVars();

        this.root.render(
            <App
                hass={this._hass}
                narrow={this._narrow}
                toggleMenu={() => {
                    this.dispatchEvent(new Event("hass-toggle-menu"));
                }}
            />,
            this.container
        );
    }

    syncCSSVars() {
        const hassStyles = window.parent.getComputedStyle(window.parent.document.documentElement);

        for (const propertyName of hassStyles) {
            if (propertyName.startsWith("--")) {
                const value = hassStyles.getPropertyValue(propertyName);

                this.container.style.setProperty(propertyName, value);
            }
        }
    }
}

export default ScenePresetsPanel;
