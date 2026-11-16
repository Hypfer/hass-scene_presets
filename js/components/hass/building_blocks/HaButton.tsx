import React, {Component} from "react";

interface HaButtonProps {
    label: string,
    onClick: (event: Event) => void;
    slot?: string,
    appearance?: "accent" | "filled" | "outlined" | "plain"
}

class HaButton extends Component<HaButtonProps> {
    private elementRef: React.RefObject<HTMLInputElement | null>;
    private label: string;
    private slot: string | undefined;

    constructor(props: HaButtonProps) {
        super(props);

        this.label = props.label;
        this.slot = props.slot;

        this.elementRef = React.createRef();
    }

    handleClick = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();

        this.props.onClick(event);
    };

    componentDidMount() {
        this.elementRef.current!.addEventListener("click", this.handleClick);
    }

    componentWillUnmount() {
        this.elementRef.current!.removeEventListener("click", this.handleClick);
    }

    render() {
        return (
            <ha-button
                ref={this.elementRef}
                slot={this.slot}
                appearance={this.props.appearance ?? "plain"}
            >
                {this.label}
            </ha-button>
        );
    }

}

export default HaButton;
