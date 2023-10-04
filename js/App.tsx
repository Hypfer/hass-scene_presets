import React from "react";

import presets from "../custom_components/scene_presets/presets.json";

const Tile :React.FunctionComponent<{
    name: string,
    imgSrc?: string
}> = ({
    name,
    imgSrc
}): JSX.Element => {
    return (
        <div
            style={{
                margin: "10px",
                padding: "20px",
                borderRadius: "15px",
                position: "relative",
                flex: "0 0  calc(33.33% - 20px)",
                height: "150px",
                width: "250px"
            }}
        >
            {
                imgSrc &&
                (
                    <>
                        <img
                            src={imgSrc}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                objectFit: "cover",
                                width: "100%",
                                height: "100%",
                                borderRadius: "15px",
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                background: "linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5))"
                            }}
                        ></div>
                    </>
                )
            }

            <p
                style={{
                    position: "absolute",
                    bottom: "15px",
                    left: "15px",
                    margin: "0",
                    fontFamily: "sans-serif"
                }}
            >
                {name}
            </p>
        </div>
    );
};

export const App :React.FunctionComponent = (): JSX.Element => {
    return (
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
    );
};
