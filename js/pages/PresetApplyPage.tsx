import React, {useEffect, useMemo, useState} from "react";
import {PresetTile} from "../components/PresetTile";
import {useLocalStorage} from "../hooks/useLocalStorage";
import HaSwitch from "../components/hass/building_blocks/HaSwitch";
import {HaTargetSelector, HaTargetSelectorValue} from "../components/hass/selectors/HaTargetSelector";
import {HaNumberSelector} from "../components/hass/selectors/HaNumberSelector";
import HaIconButton from "../components/hass/building_blocks/HaIconButton";
import {Category, Preset} from "../types";
import HaDialog from "../components/hass/building_blocks/HaDialog";
import MwcButton from "../components/hass/building_blocks/MwcButton";
import {DynamicSceneTile} from "../components/DynamicSceneTile";

const DEFAULT_TUNABLE_SETTINGS = {
    shuffle: false,
    smartShuffle: false,
    customBrightness: false,
    customBrightnessValue: 128,
    customTransition: false,
    customTransitionValue: 60,

    dynamic: false,
    dynamicTransitionValue: 45,
    dynamicIntervalValue: 60,
};

const DYNAMIC_SCENE_REFRESH_INTERVAL = 30*1000;

export const Switch :React.FunctionComponent<{
    label: string,
    value: boolean,
    setValue: (newValue: boolean) => void
}> = ({
    label,
    value,
    setValue
}): JSX.Element => {
    return (
        <label
            style={{
                lineHeight: "3rem"
            }}
        >
            <span style={{marginRight: "0.5rem"}}>{label}</span>
            <HaSwitch
                value={value}
                onValueChanged={(value) => {
                    setValue(value);
                }}
            />
        </label>
    );
};


export const OptionalNumberSelector :React.FunctionComponent<{
    label: string,
    enabled: boolean,
    setEnabled: (newValue: boolean) => void,
    value: number,
    setValue: (newValue: number) => void,
    minValue: number,
    maxValue: number,
    hass: any,
    extraSelectorProps?: any
}> = ({
    label,
    enabled,
    setEnabled,
    value,
    setValue,
    minValue,
    maxValue,
    hass,
    extraSelectorProps = {}
}): JSX.Element => {
    return (
        <label
            style={{
                lineHeight: "3rem"
            }}
        >
            <span style={{marginRight: "0.5rem"}}>{label}</span>
            <HaSwitch
                value={enabled}
                onValueChanged={(value) => {
                    setEnabled(value);
                }}
            />
            {
                enabled &&
                <div
                    style={{
                        maxWidth: "540px"
                    }}
                >
                    <HaNumberSelector
                        hass={hass}
                        selector={{
                            "number": {
                                "min": minValue,
                                "max": maxValue,

                                ...extraSelectorProps
                            }
                        }}
                        value={value}
                        onValueChanged={(value: number) => {
                            setValue(value);
                        }}
                    />
                </div>
            }
        </label>
    );
};

export const NumberSelector :React.FunctionComponent<{
    label: string,
    value: number,
    setValue: (newValue: number) => void,
    minValue: number,
    maxValue: number,
    hass: any,
    extraSelectorProps?: any
}> = ({
    label,
    value,
    setValue,
    minValue,
    maxValue,
    hass,
    extraSelectorProps = {}
}): JSX.Element => {
    return (
        <label
            style={{
                lineHeight: "3rem"
            }}
        >
            <span style={{marginRight: "0.5rem"}}>{label}</span>

            <div
                style={{
                    maxWidth: "540px"
                }}
            >
                <HaNumberSelector
                    hass={hass}
                    selector={{
                        "number": {
                            "min": minValue,
                            "max": maxValue,

                            ...extraSelectorProps
                        }
                    }}
                    value={value}
                    onValueChanged={(value: number) => {
                        setValue(value);
                    }}
                />
            </div>
        </label>
    );
};



export const PresetApplyPage: React.FunctionComponent<{
    hass: any,
    categories: Array<Category>,
    presets: Array<Preset>,
}> = ({
    hass,
    categories,
    presets
}): JSX.Element => {
    const [targets, setTargets] = useLocalStorage<HaTargetSelectorValue>("scene_presets_apply_page_targets", {});

    const [shuffle, setShuffle] = useLocalStorage<boolean>("scene_presets_apply_page_shuffle", DEFAULT_TUNABLE_SETTINGS.shuffle);
    const [smartShuffle, setSmartShuffle] = useLocalStorage<boolean>("scene_presets_apply_page_smart_shuffle", DEFAULT_TUNABLE_SETTINGS.smartShuffle);
    const [customBrightness, setCustomBrightness] = useLocalStorage<boolean>("scene_presets_apply_page_custom_brightness", DEFAULT_TUNABLE_SETTINGS.customBrightness);
    const [customBrightnessValue, setCustomBrightnessValue] = useLocalStorage<number>("scene_presets_apply_page_custom_brightness_value", DEFAULT_TUNABLE_SETTINGS.customBrightnessValue);
    const [customTransition, setCustomTransition] = useLocalStorage<boolean>("scene_presets_apply_page_custom_transition", DEFAULT_TUNABLE_SETTINGS.customTransition);
    const [customTransitionValue, setCustomTransitionValue] = useLocalStorage<number>("scene_presets_apply_page_custom_transition_value", DEFAULT_TUNABLE_SETTINGS.customTransitionValue);

    const [dynamic, setDynamic] = useLocalStorage<boolean>("scene_presets_apply_page_dynamic", DEFAULT_TUNABLE_SETTINGS.dynamic);
    const [dynamicTransitionValue, setDynamicTransitionValue] = useLocalStorage<number>("scene_presets_apply_page_dynamic_transition_value", DEFAULT_TUNABLE_SETTINGS.dynamicTransitionValue);
    const [dynamicIntervalValue, setDynamicIntervalValue] = useLocalStorage<number>("scene_presets_apply_page_dynamic_interval_value", DEFAULT_TUNABLE_SETTINGS.dynamicIntervalValue);

    const [lastDynamicSceneRefresh, setLastDynamicSceneRefresh] = useState(0);

    const [dynamicSceneIds, setDynamicSceneIds] = useState<Array<string>>([]); // Does this make sense or is this a useless attempt at optimization?
    const [dynamicScenes, setDynamicScenes] = useState<any>({});
    const memoizedDynamicSceneIds = useMemo(() => dynamicSceneIds, [dynamicSceneIds]); // Does this make sense or is this a useless attempt at optimization?


    const [favoritePresets, setFavoritePresets] = useLocalStorage<Array<string>>("scene_presets_apply_page_favorite_presets", []);

    const [automationDialogOpen, setAutomationDialogOpen] = useState<boolean>(false);
    const [lastActionPayload, setLastActionPayload] = useState<any>({});
    const [prettyLastActionPayload, setPrettyLastActionPayload] = useState<string>("");

    const fetchActiveDynamicScenes = React.useCallback(() => {
        hass.callWS({
            type: "scene_presets/get_dynamic_scenes",
        }).then(result => {
            const ids: Array<string> = [];
            const scenes: any = {};

            result?.dynamic_scenes?.forEach(s => {
                ids.push(s.id);
                scenes[s.id] = {
                    preset_id: s.parameters.preset_id,
                    interval: s.interval,
                    transition: s.parameters.transition
                };
            });

            setDynamicScenes(scenes);
            setDynamicSceneIds(ids);
        }).catch(() => {
            /* intentional */
        }).finally(() => {
            setLastDynamicSceneRefresh(Date.now());
        });
    }, [
        hass,
        setLastDynamicSceneRefresh,

        setDynamicSceneIds
    ]);

    const handlePresetTap = React.useCallback(
        (id) => {
            let payload: any = {
                preset_id: id,
                targets: targets,

                brightness: customBrightness ? customBrightnessValue : undefined,
            };
            let service: string;

            if (dynamic) {
                payload = {
                    ...payload,
                    transition: dynamicTransitionValue,
                    interval: dynamicIntervalValue
                };

                service = "start_dynamic_scene";
            } else {
                payload = {
                    ...payload,
                    shuffle: shuffle,
                    smart_shuffle: smartShuffle,
                    transition: customTransition ? customTransitionValue : undefined,
                };

                service = "apply_preset";
            }

            setLastActionPayload({
                service: `scene_presets.${service}`,
                data: payload
            });

            hass.callService(
                "scene_presets",
                service,
                payload
            ).finally(() => {
                fetchActiveDynamicScenes();
            });
        },
        [
            hass, setLastActionPayload,
            targets, shuffle, smartShuffle,
            customBrightness, customBrightnessValue,
            customTransition, customTransitionValue,

            dynamic, dynamicIntervalValue, dynamicTransitionValue,
            fetchActiveDynamicScenes
        ]
    );

    const handleDynamicSceneTap = React.useCallback(
        (id: string) => {
            hass.callService(
                "scene_presets",
                "stop_dynamic_scene",
                {id: id}
            ).finally(() => {
                fetchActiveDynamicScenes();
            });
        },
        [
            hass, fetchActiveDynamicScenes
        ]
    );

    const presetsByCategories = React.useMemo(() => {
        const out = {};

        categories.forEach(category => {
            out[category.id] = presets.filter(p => p.categoryId === category.id);
        });

        return out;
    }, [categories, presets]);


    const tiles = React.useMemo(() => {
        const allTiles: {[key: string] : JSX.Element} = {};
        const favoriteTiles: Array<string> = [];

        presets.forEach((preset, i) => {
            const isFav = favoritePresets.includes(preset.id);

            allTiles[preset.id] = <PresetTile
                id={preset.id}
                name={preset.name}
                imgSrc={preset.img ? "/assets/scene_presets/" + preset.img : undefined}
                onClick={(id) => {
                    handlePresetTap(id);
                }}
                isFav={isFav}
                onFavClick={() => {
                    if (!favoritePresets.includes(preset.id)) {
                        setFavoritePresets([...favoritePresets, preset.id]);
                    } else {
                        setFavoritePresets(favoritePresets.filter(e => e !== preset.id));
                    }
                }}
            />;

            if (isFav) {
                favoriteTiles.push(preset.id);
            }
        });

        return {
            all: allTiles,
            favoriteIds: favoriteTiles,
        };
    }, [presets, favoritePresets, handlePresetTap, setFavoritePresets]);

    const presetMap = useMemo(() => {
        const _presetMap = {};

        presets.forEach(p => {
            _presetMap[p.id] = p;
        });

        return _presetMap;
    }, [presets]);

    /**
     * This is a hack that works around the fact that for whatever reason, componentWillUnmount never fires.
     * Possibly because using react in this setup is cursed
     */
    useEffect(() => {
        if (Date.now() - lastDynamicSceneRefresh >= DYNAMIC_SCENE_REFRESH_INTERVAL) {
            fetchActiveDynamicScenes();
        }
    }, [hass, fetchActiveDynamicScenes]); // eslint-disable-line react-hooks/exhaustive-deps 

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
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "0.5rem",
                                        right: "1rem"
                                    }}>
                                    <HaIconButton
                                        icon={"mdi:robot"}
                                        onClick={
                                            () => {
                                                setPrettyLastActionPayload(JSON.stringify(lastActionPayload, null, 2));
                                                setAutomationDialogOpen(true);
                                            }
                                        }
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

                                            setDynamic(DEFAULT_TUNABLE_SETTINGS.dynamic);
                                            setDynamicTransitionValue(DEFAULT_TUNABLE_SETTINGS.dynamicTransitionValue);
                                            setDynamicIntervalValue(DEFAULT_TUNABLE_SETTINGS.dynamicIntervalValue);
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
                            <Switch
                                label={"Dynamic"}
                                value={dynamic}
                                setValue={(v) => setDynamic(v)}
                            />
                        </label>
                        <br/>
                        {
                            !dynamic &&
                            <>
                                <Switch
                                    label={"Shuffle Colors"}
                                    value={shuffle}
                                    setValue={(v) => setShuffle(v)}
                                />
                                <br/>

                                {
                                    shuffle &&
                                    <>
                                        <div
                                            style={{marginLeft: "1rem"}}
                                        >
                                            <Switch
                                                label={"Smart Shuffle"}
                                                value={smartShuffle}
                                                setValue={(v) => setSmartShuffle(v)}
                                            />
                                        </div>
                                    </>
                                }
                            </>
                        }
                        {
                            dynamic &&
                            <>
                                <NumberSelector
                                    label={"Interval"}
                                    value={dynamicIntervalValue}
                                    setValue={(v) => setDynamicIntervalValue(v)}
                                    minValue={0}
                                    maxValue={300}
                                    hass={hass}
                                    extraSelectorProps={{"unit_of_measurement": "seconds"}}
                                />

                                <NumberSelector
                                    label={"Transition"}
                                    value={dynamicTransitionValue}
                                    setValue={(v) => setDynamicTransitionValue(v)}
                                    minValue={0}
                                    maxValue={300}
                                    hass={hass}
                                    extraSelectorProps={{"unit_of_measurement": "seconds"}}
                                />
                            </>
                        }



                        <OptionalNumberSelector
                            label={"Custom Brightness"}
                            enabled={customBrightness}
                            setEnabled={(v) => setCustomBrightness(v)}
                            value={customBrightnessValue}
                            setValue={(v) => setCustomBrightnessValue(v)}
                            minValue={0}
                            maxValue={1000}
                            hass={hass}
                        />
                        {
                            !customBrightness && !dynamic &&
                            <br/>
                        }

                        {
                            !dynamic &&
                            <OptionalNumberSelector
                                label={"Custom Transition"}
                                enabled={customTransition}
                                setEnabled={(v) => setCustomTransition(v)}
                                value={customTransitionValue}
                                setValue={(v) => setCustomTransitionValue(v)}
                                minValue={0}
                                maxValue={300}
                                hass={hass}
                                extraSelectorProps={{"unit_of_measurement": "seconds"}}
                            />
                        }
                    </div>
                </ha-card>

                {
                    memoizedDynamicSceneIds.length > 0 &&
                    <div
                        key={"category_dynamic_scenes"}
                    >
                        <h3
                            style={{
                                fontFamily: "sans-serif"
                            }}
                        >
                            Dynamic scenes
                        </h3>
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "center"
                            }}
                        >
                            {
                                memoizedDynamicSceneIds.map(id => {
                                    const preset = presetMap[dynamicScenes[id]?.preset_id];

                                    const name = preset?.name ?? "Unknown Preset";
                                    const imgSrc = preset?.img ? "/assets/scene_presets/" + preset.img : undefined;

                                    return <DynamicSceneTile
                                        key={"active_dynamic_scene_" + id}
                                        id={id}
                                        name={name}
                                        interval={dynamicScenes[id]?.interval ?? -1}
                                        transition={dynamicScenes[id]?.transition ?? -1}
                                        imgSrc={imgSrc}
                                        onClick={(id) => {
                                            handleDynamicSceneTap(id);
                                        }}
                                    />;
                                })
                            }
                        </div>
                    </div>
                }

                {
                    tiles.favoriteIds.length > 0 &&
                    <div
                        key={"category_favorites"}
                    >
                        <h3
                            style={{
                                fontFamily: "sans-serif"
                            }}
                        >
                            Favorites
                        </h3>
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "center"
                            }}
                        >
                            {
                                tiles.favoriteIds.map(id => {
                                    return <React.Fragment key={"favorite_" + id}>
                                        {tiles.all[id]}
                                    </React.Fragment>;
                                })
                            }
                        </div>
                    </div>

                }

                {
                    categories.map(({name, id}) => {
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
                                    {presetsByCategories[id].map(p => {
                                        return <React.Fragment key={id + "_" + p.id}>
                                            {tiles.all[p.id]}
                                        </React.Fragment>;
                                    })}
                                </div>
                            </div>
                        );
                    })
                }

                <HaDialog
                    open={automationDialogOpen}
                    onClose={() => {
                        setAutomationDialogOpen(false);
                    }}
                    heading={"Last action payload"}
                >
                    <div>
                        Here you can see the payload used by your last action that applied a preset or started a dynamic scene.
                        This can be used in automations, scripts etc.
                    </div>

                    <div style={{padding: "1rem"}}>
                        <pre
                            style={{
                                backgroundColor: "#000000",
                                padding: "1rem",
                                userSelect: "text",
                                color: "#ffffff",
                                fontFamily: "monospace",
                                fontWeight: 200,
                                whiteSpace: "pre-wrap"
                            }}
                        >
                            {prettyLastActionPayload}
                        </pre>
                    </div>

                    <MwcButton
                        label={"Close"}
                        onClick={() => {
                            setAutomationDialogOpen(false);
                        }}
                        slot={"secondaryAction"}
                    />
                </HaDialog>
            </div>

        </div>
    );
};
