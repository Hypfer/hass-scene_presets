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
            style={{
                margin: "10px",
                padding: "15px",
                borderRadius: "15px",
                position: "relative",
                flexGrow: "1",
                flexShrink: "0",
                flexBasis: "calc(20%)",
                maxWidth: "33%",
                height: "6rem",


                cursor: "pointer"
            }}
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
                                borderRadius: "15px",
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
                    fontFamily: "sans-serif",
                    color: "#ffffff",
                }}
            >
                {name}
            </p>
        </div>
    );
};
