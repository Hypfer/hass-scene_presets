import React from "react";
import {MdOutlineMenu} from "react-icons/md";

interface TopBarProps {
    narrow: boolean,
    toggleMenu: () => void
}

export const TopBar: React.FunctionComponent<TopBarProps> = ({
    narrow,
    toggleMenu
}) => {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "var(--app-header-background-color)",
                height: "var(--header-height)",
                paddingLeft: "1rem",
                color: "var(--app-header-text-color,#fff)",
                borderBottom: "var(--app-header-border-bottom,none)",
                fontFamily: "var(--paper-font-title_-_font-family)",
                fontSize: "var(--paper-font-title_-_font-size)",
                fontWeight: "var(--paper-font-title_-_font-weight)",
                lineHeight: "var(--paper-font-title_-_line-height)",
                textOverflow: "var(--paper-font-title_-_text-overflow)",
                overflow: "var(--paper-font-title_-_overflow)",
                whiteSpace: "var(--paper-font-title_-_white-space)" as any,
                userSelect: "none"
            }}
        >
            {
                narrow &&
                <div
                    style={{
                        marginRight: "1rem",
                        cursor: "pointer",
                        fontSize: "1.75rem"
                    }}
                    onClick={toggleMenu}
                >
                    <MdOutlineMenu
                        style={{
                            verticalAlign: "bottom"
                        }}
                    />
                </div>
            }
            <div
                style={{

                }}
            >
                Scene Presets
            </div>
        </div>
    );
};
