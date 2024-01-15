import React, {Component} from "react";
import HaIcon from "./HaIcon";

interface HaIconButtonProps {
    icon: string;
    onClick: (event: Event) => void;

    size: number;
    iconSize: number;
}

class HaIconButton extends Component<HaIconButtonProps> {
    private elementRef: React.RefObject<HTMLInputElement>;
    private icon: string;
    private size: number;
    private iconSize: number;

    constructor(props: HaIconButtonProps) {
        super(props);

        this.icon = props.icon;
        this.size = props.size;
        this.iconSize = props.iconSize;

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
            <ha-icon-button
                style={{"--mdc-icon-button-size": `${this.size}px`}}
                ref={this.elementRef}
            >
                <HaIcon icon={this.icon} size={this.iconSize}/>
            </ha-icon-button>
        );
    }

}

export default HaIconButton;
