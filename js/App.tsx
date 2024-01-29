import React, {useEffect} from "react";
import {PresetApplyPage} from "./pages/PresetApplyPage";
import {Category, Preset} from "./types";
import {useSessionStorage} from "./hooks/useSessionStorage";

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
            ["ha-switch"]: any;
            ["ha-icon"]: any;
            ["ha-icon-button"]: any;
            ["ha-card"]: any;
            ["ha-settings-row"]: any;
            ["ha-dialog"]: any;
            ["mwc-button"]: any;
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
    const [categories, setCategories] = useSessionStorage<Array<Category>>("scene_presets_categories",[]);
    const [presets, setPresets] = useSessionStorage<Array<Preset>>("scene_presets_presets",[]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/assets/scene_presets/scene_presets.json");
                const data = await response.json();

                setCategories(data.categories);
                setPresets(data.presets);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData().then(() => {
            /* intentional */
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps 

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

                categories={categories}
                presets={presets}
            />
        </>
    );
};
