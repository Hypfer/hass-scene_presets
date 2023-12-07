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
    private styleElem: HTMLStyleElement;
    private container: HTMLDivElement;

    constructor() {
        super();
    }

    connectedCallback() {
        this.shadow = this.attachShadow({mode: "open"});

        this.styleElem = document.createElement("style");
        this.container = document.createElement("div");

        this.shadow.append(this.styleElem);
        this.shadow.append(this.container);

        // TODO: Figure out why styles can only be injected in this clunky way
        this.styleElem.textContent += `
            .scene-preset-tile {
                margin: 10px;
                padding: 15px;
                border-radius: 15px;
                position: relative;
                flex: 1 0 calc(20%);
                max-width: 33%;
                height: 6rem;
                cursor: pointer;
                
                transition: filter 0.3s;
            }
            .scene-preset-tile:active {
                filter: brightness(0.7);
            }
            
            .scene-preset-tile-img {
                position: absolute;
                top: 0;
                left: 0;
                object-fit: cover;
                width: 100%;
                height: 100%;
                border-radius: 15px;
            }
            .scene-preset-time-img-text-bg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 15px;
                background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5));
            }
            .scene-preset-time-text {
                position: absolute;
                bottom: 15px;
                left: 15px;
                margin: 0;
                font-family: sans-serif;
                color: #ffffff;
            }
        `;

        this.root = createRoot(this.container);

        this.initialize().then(() => {
            console.log("dependencies loaded");

            this.initialized = true;
        });
    }

    set hass(hass) {
        this._hass = hass;

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
        await loadConfigDashboard();
    }
}

export default ScenePresetsPanel;
