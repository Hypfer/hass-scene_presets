import React from "react";

import presets from "../custom_components/scene_presets/presets.json";
import {Tile} from "./components/Tile";
import {TopBar} from "./components/TopBar";


export const App : React.FunctionComponent<{
    hass: any,
    narrow: boolean,
    toggleMenu: () => void
}> = ({
    hass,
    narrow,
    toggleMenu
}): JSX.Element => {
    return (
        <>
            <TopBar
                narrow={narrow}
                toggleMenu={toggleMenu}
            />
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
