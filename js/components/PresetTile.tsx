import React from "react";
import HaIconButton from "./hass/building_blocks/HaIconButton";

export const PresetTile :React.FunctionComponent<{
    id: string,
    name: string,
    imgSrc?: string
    onClick?: (name: string) => void

    onFavClick?: (name: string) => void
    isFav?: boolean
}> = ({
    id,
    name,
    imgSrc,
    onClick,

    onFavClick,
    isFav
}): React.JSX.Element => {
    // These two variables are _somehow_ required because without the change in key, the icon won't change even though we get rerendered ??
    const favedIcon = <HaIconButton
        key={"id_fav"}
        icon={"mdi:star"}
        onClick={() => {
            onFavClick?.(id);
        }}

        size={28}
        iconSize={24}
    />;
    const unFavedIcon = <HaIconButton
        key={"id_unfav"}
        icon={"mdi:star-outline"}
        onClick={() => {
            onFavClick?.(id);
        }}

        size={28}
        iconSize={24}
    />;

    return (
        <div
            className={"tile"}
            onClick={() => {
                onClick?.(id);
            }}
        >
            {
                onFavClick &&
                <div
                    className={"tile-top-icon-container"}
                >
                    {
                        isFav ? favedIcon : unFavedIcon
                    }
                </div>
            }

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
