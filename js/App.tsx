import React from "react";

import presets from "../custom_components/scene_presets/presets.json";
import {Tile} from "./components/Tile";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['ha-app-layout']: any;
            ['app-header']: any;
            ['app-toolbar']: any
            ['ha-menu-button']: any
            ['ha-entity-toggle']: any;
            ['ha-top-app-bar-fixed']: any
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

            <div
                style={{
                    padding: "2rem"
                }}
            >
                {
                    presets.sets.filter(set => set.name !== "Defaults").map(({name, scenes}) => {
                        return (
                            <div
                                key={"scene_" + name}
                            >
                                <h3
                                    style={{
                                        fontFamily: "sans-serif"
                                    }}
                                >
                                    {name}
                                </h3>
                                <div
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        justifyContent: "center"
                                    }}
                                >
                                    {
                                        scenes.map((scene) => {
                                            return (
                                                <Tile
                                                    key={"scene_" + name}
                                                    name={scene.name}
                                                    imgSrc={scene.img ? "/assets/scene_presets/" + scene.img : undefined}
                                                />
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </>
    );
};
