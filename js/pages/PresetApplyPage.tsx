import React from "react";
import presets from "../../custom_components/scene_presets/presets.json";
import {Tile} from "../components/Tile";
import {useLocalStorage} from "../hooks/useLocalStorage";
import HaSwitch from "../components/hass/building_blocks/HaSwitch";
import {HaTargetSelector, HaTargetSelectorValue} from "../components/hass/selectors/HaTargetSelector";
import {HaNumberSelector} from "../components/hass/selectors/HaNumberSelector";


export const PresetApplyPage: React.FunctionComponent<{
    hass: any
}> = ({
    hass,
}): JSX.Element => {
    const [targets, setTargets] = useLocalStorage<HaTargetSelectorValue>("scene_presets_apply_page_targets", {});
    const [shuffle, setShuffle] = useLocalStorage<boolean>("scene_presets_apply_page_shuffle", false);
    const [customBrightness, setCustomBrightness] = useLocalStorage<boolean>("scene_presets_apply_page_custom_brightness", false);
    const [customBrightnessValue, setCustomBrightnessValue] = useLocalStorage<number>("scene_presets_apply_page_custom_brightness_value", 128);
    const [customTransition, setCustomTransition] = useLocalStorage<boolean>("scene_presets_apply_page_custom_transition", false);
    const [customTransitionValue, setCustomTransitionValue] = useLocalStorage<number>("scene_presets_apply_page_custom_transition_value", 60);

    const applyPreset = React.useCallback(
        (name) => {
            hass.callService(
                "scene_presets",
                "apply_preset", {
                    preset_id: name,
                    targets: targets,
                    shuffle: shuffle,
                    brightness: customBrightness ? customBrightnessValue : undefined,
                    transition: customTransition ? customTransitionValue : undefined,
                }
            );
        },
        [
            hass,
            targets, shuffle,
            customBrightness, customBrightnessValue,
            customTransition, customTransitionValue
        ]
    );

    const presetsToUse = presets.sets.filter(set => set.name !== "Defaults");

    return (
        <div
            style={{
                padding: "1rem"
            }}
        >
            <div
                style={{
                    maxWidth: "1080px", //same as hass
                    marginLeft: "auto",
                    marginRight: "auto"
                }}
            >
                <ha-card>
                    <div
                        style={{
                            padding: "1rem"
                        }}
                    >
                        <span style={{
                            fontWeight: "bolder",
                            fontSize: "1.25rem"
                        }}>
                        Targets
                        </span>
                        <div
                            style={{
                                marginTop: "1rem"
                            }}
                        >
                            <HaTargetSelector
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
                        <div
                            style={{
                                fontWeight: "bolder",
                                marginTop: "1rem",
                                marginBottom: "1rem",
                                fontSize: "1.25rem"
                            }}
                        >
                        Tunables
                        </div>
                        <label
                            style={{
                                lineHeight: "3rem"
                            }}
                        >
                            <span style={{marginRight: "0.5rem"}}>Shuffle Colors</span>
                            <HaSwitch
                                value={shuffle}
                                onValueChanged={(value) => {
                                    setShuffle(value);
                                }}
                            />
                        </label>
                        <br/>
                        <label
                            style={{
                                lineHeight: "3rem"
                            }}
                        >
                            <span style={{marginRight: "0.5rem"}}>Custom Brightness</span>
                            <HaSwitch
                                value={customBrightness}
                                onValueChanged={(value) => {
                                    setCustomBrightness(value);
                                }}
                            />
                            {
                                customBrightness &&
                            <div
                                style={{
                                    maxWidth: "540px"
                                }}
                            >
                                <HaNumberSelector
                                    hass={hass}
                                    selector={{
                                        "number": {
                                            "min": 0,
                                            "max": 255
                                        }
                                    }}
                                    value={customBrightnessValue}
                                    onValueChanged={(value) => {
                                        setCustomBrightnessValue(value);
                                    }}
                                />
                            </div>
                            }
                            {
                                !customBrightness &&
                            <br/>
                            }
                        </label>
                        <label
                            style={{
                                lineHeight: "3rem"
                            }}
                        >
                            <span style={{marginRight: "0.5rem"}}>Custom Transition</span>
                            <HaSwitch
                                value={customTransition}
                                onValueChanged={(value) => {
                                    setCustomTransition(value);
                                }}
                            />
                            {
                                customTransition &&
                            <div
                                style={{
                                    maxWidth: "540px"
                                }}
                            >
                                <HaNumberSelector
                                    hass={hass}
                                    selector={{
                                        "number": {
                                            "min": 0,
                                            "max": 300,
                                            "unit_of_measurement": "seconds"
                                        }
                                    }}
                                    value={customTransitionValue}
                                    onValueChanged={(value) => {
                                        setCustomTransitionValue(value);
                                    }}
                                />
                            </div>
                            }
                        </label>
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
                                                        applyPreset(name);
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

        </div>
    );
};
