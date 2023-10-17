import React from "react";
import HaSelector, {HaTargetSelectorValue} from "../components/HaSelector";
import presets from "../../custom_components/scene_presets/presets.json";
import {Tile} from "../components/Tile";
import {useLocalStorage} from "../hooks/useLocalStorage";


export const PresetApplyPage: React.FunctionComponent<{
    hass: any
}> = ({
    hass,
}): JSX.Element => {
    const [targets, setTargets] = useLocalStorage<HaTargetSelectorValue>("scene_presets_apply_page_targets", {});
    const presetsToUse = presets.sets.filter(set => set.name !== "Defaults");

    return (
        <div
            style={{
                margin: "1rem"
            }}
        >
            <ha-card>
                <div
                    style={{
                        padding: "1rem"
                    }}
                >
                    <span style={{fontWeight: "bolder"}}>Targets</span>
                    <HaSelector
                        hass={hass}
                        selector={{
                            "target": {
                                "entity": {
                                    "domain": [
                                        "light",
                                        "group"
                                    ]
                                }
                            }
                        }}
                        value={targets}
                        onValueChanged={(value) => {
                            setTargets(value);
                        }}
                    />
                </div>
            </ha-card>

            {
                presetsToUse.map(({name, scenes}) => {
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
                                                onClick={(name) => {
                                                    hass.callService("scene_presets", "apply_preset", { preset_id: name, targets: targets });
                                                }}
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
    );
};
