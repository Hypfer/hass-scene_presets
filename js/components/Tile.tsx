import React from "react";
import HaIconButton from "./hass/building_blocks/HaIconButton";

export const Tile :React.FunctionComponent<{
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
}): JSX.Element => {
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
            className={"scene-preset-tile"}
            onClick={() => {
                onClick?.(id);
            }}
        >
            {
                onFavClick &&
                <div
                    className={"scene-preset-tile-fav-btn-container"}
                >
                    {
                        isFav ? favedIcon : unFavedIcon
                    }
                </div>
            }

            <div
                className={"scene-preset-tile-content"}
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
                                className={"scene-preset-tile-img-text-bg"}
                            ></div>
                        </>
                    )
                }
                <p
                    className={"scene-preset-tile-text"}
                >
                    {name}
                </p>
            </div>
        </div>
    );
};
