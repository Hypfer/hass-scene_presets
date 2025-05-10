import React, {Component} from "react";

interface HaIconProps {
    icon: string;

    size: number;
}

class HaIcon extends Component<HaIconProps> {
    private elementRef: React.RefObject<HTMLInputElement | null>;
    private icon: string;
    private size: number;

    constructor(props: HaIconProps) {
        super(props);

        this.icon = props.icon;
        this.size = props.size;

        this.elementRef = React.createRef();
    }

    render() {
        return (
            <ha-icon
                style={{
                    verticalAlign: "text-top",
                    display: "unset",

                    "--mdc-icon-size": `${this.size}px`
                }}
                ref={this.elementRef}
                icon={this.icon}
            />
        );
    }

}

export default HaIcon;
