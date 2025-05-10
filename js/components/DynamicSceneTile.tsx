import React from "react";
import HaIcon from "./hass/building_blocks/HaIcon";

export const DynamicSceneTile :React.FunctionComponent<{
    id: string,
    name: string,
    interval: number,
    transition: number,
    imgSrc?: string
    onClick?: (name: string) => void
}> = ({
    id,
    name,
    interval,
    transition,
    imgSrc,
    onClick,
}): React.JSX.Element => {
    return (
        <div
            className={"tile"}
            onClick={() => {
                onClick?.(id);
            }}
        >
            <div
                className={"tile-content"}
            >
                {
                    imgSrc ?

                        <img
                            src={imgSrc}
                            className={"tile-bg-img"}
                        />
                        :
                        <div
                            className={"tile-bg-no-img"}
                        >
                        </div>

                }

                <div
                    className={"tile-center-icon-container"}
                >
                    <HaIcon icon={"mdi:stop-circle"} size={48}/>
                </div>

                <div
                    className={"tile-top-info-bg"}
                ></div>
                <div
                    className={"tile-top-info-container"}
                >
                    I: {interval}s, T: {transition}s
                </div>

                <div
                    className={"tile-text-bg"}
                ></div>
                <p
                    className={"tile-text"}
                >
                    {name}
                </p>
            </div>
        </div>
    );
};
