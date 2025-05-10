import React, {Component} from "react";

interface MwcButtonProps {
    label: string,
    onClick: (event: Event) => void;
    slot?: string
}

class MwcButton extends Component<MwcButtonProps> {
    private elementRef: React.RefObject<HTMLInputElement | null>;
    private label: string;
    private slot: string | undefined;

    constructor(props: MwcButtonProps) {
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
            <mwc-button
                ref={this.elementRef}
                slot={this.slot}
            >
                {this.label}
            </mwc-button>
        );
    }

}

export default MwcButton;
