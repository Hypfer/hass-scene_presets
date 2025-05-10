import React, {Component} from "react";

export interface HaSelectorProps {
    hass: any;
    selector: any;
    value: any;
    onValueChanged: (value: any) => void
}

abstract class HaSelector<P> extends Component<P & HaSelectorProps> {
    private elementRef: React.RefObject<HTMLElement | null>;

    constructor(props: P & HaSelectorProps) {
        super(props);

        this.elementRef = React.createRef();
    }

    handleValueChanged = (event) => {
        this.props.onValueChanged(event.detail.value);
    };

    componentDidMount() {
        this.elementRef.current!.addEventListener("value-changed", this.handleValueChanged);
    }

    componentWillUnmount() {
        this.elementRef.current!.removeEventListener("value-changed", this.handleValueChanged);
    }

    render() {
        return (
            <ha-selector
                ref={this.elementRef}
                hass={this.props.hass}
                selector={this.props.selector}
                value={this.props.value}
            />
        );
    }

}

export default HaSelector;
