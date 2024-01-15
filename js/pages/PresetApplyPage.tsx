import React from "react";
import presets from "../../custom_components/scene_presets/presets.json";
import {Tile} from "../components/Tile";
import {useLocalStorage} from "../hooks/useLocalStorage";
import HaSwitch from "../components/hass/building_blocks/HaSwitch";
import {HaTargetSelector, HaTargetSelectorValue} from "../components/hass/selectors/HaTargetSelector";
import {HaNumberSelector} from "../components/hass/selectors/HaNumberSelector";
import HaIconButton from "../components/hass/building_blocks/HaIconButton";

const DEFAULT_TUNABLE_SETTINGS = {
    shuffle: false,
    smartShuffle: false,
    customBrightness: false,
    customBrightnessValue: 128,
    customTransition: false,
    customTransitionValue: 60
};

export const PresetApplyPage: React.FunctionComponent<{
    hass: any
}> = ({
    hass,
}): JSX.Element => {
    const [targets, setTargets] = useLocalStorage<HaTargetSelectorValue>("scene_presets_apply_page_targets", {});
    const [shuffle, setShuffle] = useLocalStorage<boolean>("scene_presets_apply_page_shuffle", DEFAULT_TUNABLE_SETTINGS.shuffle);
    const [smartShuffle, setSmartShuffle] = useLocalStorage<boolean>("scene_presets_apply_page_smart_shuffle", DEFAULT_TUNABLE_SETTINGS.smartShuffle);
    const [customBrightness, setCustomBrightness] = useLocalStorage<boolean>("scene_presets_apply_page_custom_brightness", DEFAULT_TUNABLE_SETTINGS.customBrightness);
    const [customBrightnessValue, setCustomBrightnessValue] = useLocalStorage<number>("scene_presets_apply_page_custom_brightness_value", DEFAULT_TUNABLE_SETTINGS.customBrightnessValue);
    const [customTransition, setCustomTransition] = useLocalStorage<boolean>("scene_presets_apply_page_custom_transition", DEFAULT_TUNABLE_SETTINGS.customTransition);
    const [customTransitionValue, setCustomTransitionValue] = useLocalStorage<number>("scene_presets_apply_page_custom_transition_value", DEFAULT_TUNABLE_SETTINGS.customTransitionValue);

    const applyPreset = React.useCallback(
        (name) => {
            hass.callService(
                "scene_presets",
                "apply_preset",
                {
                    preset_id: name,
                    targets: targets,
                    shuffle: shuffle,
                    smart_shuffle: smartShuffle,
                    brightness: customBrightness ? customBrightnessValue : undefined,
                    transition: customTransition ? customTransitionValue : undefined,
                }
            );
        },
        [
            hass,
            targets, shuffle, smartShuffle,
            customBrightness, customBrightnessValue,
            customTransition, customTransitionValue
        ]
    );

    const presetsToUse = presets.sets;

    return (
        <div
            style={{
                padding: "1rem",
                userSelect: "none"
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
                            <div style={{display: "flex"}}>
                                Targets
                                <div
                                    style={{
                                        marginTop: "-0.4rem",
                                        marginLeft: "0.5rem"
                                    }}>
                                    <HaIconButton
                                        icon={"mdi:broom"}
                                        onClick={() => setTargets({})}

                                        size={28}
                                        iconSize={24}
                                    />
                                </div>
                            </div>
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
                            <div style={{display: "flex"}}>
                                Tunables
                                <div
                                    style={{
                                        marginTop: "-0.4rem",
                                        marginLeft: "0.5rem"
                                    }}>
                                    <HaIconButton
                                        icon={"mdi:restore"}
                                        onClick={() => {
                                            setShuffle(DEFAULT_TUNABLE_SETTINGS.shuffle);
                                            setSmartShuffle(DEFAULT_TUNABLE_SETTINGS.smartShuffle);
                                            setCustomBrightness(DEFAULT_TUNABLE_SETTINGS.customBrightness);
                                            setCustomBrightnessValue(DEFAULT_TUNABLE_SETTINGS.customBrightnessValue);
                                            setCustomTransition(DEFAULT_TUNABLE_SETTINGS.customTransition);
                                            setCustomTransitionValue(DEFAULT_TUNABLE_SETTINGS.customTransitionValue);
                                        }}

                                        size={28}
                                        iconSize={24}
                                    />
                                </div>
                            </div>
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
                            <span style={{marginRight: "0.5rem"}}>Smart Shuffle</span>
                            <HaSwitch
                                value={smartShuffle}
                                onValueChanged={(value) => {
                                    setSmartShuffle(value);
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
                                key={"category_" + name}
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
                                        scenes.map((scene, i) => {
                                            return (
                                                <Tile
                                                    key={"scene_" + name + "_" + i}
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
