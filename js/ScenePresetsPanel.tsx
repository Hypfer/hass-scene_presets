// @ts-nocheck
// noinspection JSUnusedGlobalSymbols

import {Container} from "react-dom";
import {App} from "./App";
import {createRoot, Root} from "react-dom/client";
import {loadConfigDashboard} from "./helpers";

class ScenePresetsPanel extends HTMLElement {
    initialized: boolean = false;
    shadow: Container;
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
            .tile {
                margin: 10px;
                padding: 15px;
                border-radius: 15px;
                position: relative;
                flex: 1 0 calc(20%);
                max-width: 33%;
                height: 6rem;
                cursor: pointer;
            }
            
            .tile-content {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
            }
            .tile-content:active {
                transition: filter 0.3s;
                filter: brightness(0.7);
            }
            
            .tile-bg-img {
                position: absolute;
                top: 0;
                left: 0;
                object-fit: cover;
                width: 100%;
                height: 100%;
                border-radius: 15px;
            }
            .tile-bg-no-img {
                position: absolute;
                top: 0;
                left: 0;
                object-fit: cover;
                width: 100%;
                height: 100%;
                border-radius: 15px;
                
                background:
                    linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000),
                    linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000),
                    #ff00ff;
                
                background-size: 20px 20px;
                background-position: 0 0, 10px 10px;
            }
            
            .tile-text-bg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 15px;
                background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5));
            }
            .tile-text {
                position: absolute;
                bottom: 15px;
                left: 15px;
                margin: 0;
                font-family: sans-serif;
                color: #ffffff;
            }
            
            .tile-top-info-bg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 33%;
                border-radius: 15px;
                background: linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5));
            }
            .tile-top-info-container {
                position: absolute;
                top: 5px;
                left: 10px;
                margin: 0;
                font-family: monospace;
                font-size: 0.8rem;
                color: #ffffff;
                z-index: 1;
            }
            
            .tile-top-icon-container {
                position: absolute;
                top: 5px;
                right: 10px;
                margin: 0;
                font-family: sans-serif;
                color: #ffffff;
                z-index: 1;
            }
            
            .tile-center-icon-container {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -60%);
                font-family: sans-serif;
                color: #ffffff;
                z-index: 1;
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
        await loadConfigDashboard();
    }
}

export default ScenePresetsPanel;
