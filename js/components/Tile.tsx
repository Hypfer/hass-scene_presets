import React from "react";

export const Tile :React.FunctionComponent<{
    name: string,
    imgSrc?: string
    onClick?: (name: string) => void
}> = ({
    name,
    imgSrc,
    onClick
}): JSX.Element => {
    return (
        <div
            className={"scene-preset-tile"}
            onClick={() => {
                onClick?.(name);
            }}
        >
            {
                imgSrc &&
                (
                    <>
                        <img
                            src={imgSrc}
                            className={"scene-preset-tile-img"}
                        />
                        <div
                            className={"scene-preset-time-img-text-bg"}
                        ></div>
                    </>
                )
            }

            <p
                className={"scene-preset-time-text"}
            >
                {name}
            </p>
        </div>
    );
};
