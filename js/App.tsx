import React from "react";
import {PresetApplyPage} from "./pages/PresetApplyPage";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ["ha-app-layout"]: any;
            ["app-header"]: any;
            ["app-toolbar"]: any
            ["ha-menu-button"]: any
            ["ha-entity-toggle"]: any;
            ["ha-top-app-bar-fixed"]: any;
            ["ha-selector"]: any;
            ["ha-card"]: any;
            ["ha-settings-row"]: any;
        }
    }
}

export const App : React.FunctionComponent<{
    hass: any,
    narrow: boolean,
}> = ({
    hass,
    narrow,
}): JSX.Element => {
    return (
        <>
            <ha-top-app-bar-fixed>
                <ha-menu-button
                    slot="navigationIcon"
                    hass={hass}
                    narrow={narrow}
                />
                <div slot="title">Scene Presets</div>
            </ha-top-app-bar-fixed>

            <PresetApplyPage
                hass={hass}
            />
        </>
    );
};
