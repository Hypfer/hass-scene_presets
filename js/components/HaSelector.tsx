import React, {Component} from "react";

export interface HaTargetSelectorValue {
    entity_id?: string | Array<string>,
    device_id?: string | Array<string>,
    area_id?: string | Array<string>
}

export interface HaSelectorValue extends HaTargetSelectorValue {

}

interface HaSelectorProps {
    hass: any;
    selector: any;
    value: HaSelectorValue;
    onValueChanged: (value: HaSelectorValue) => void
}

class HaSelector extends Component<HaSelectorProps> { //TODO: Type this a bit more
    private elementRef: React.RefObject<HTMLElement>;

    constructor(props: HaSelectorProps) {
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
