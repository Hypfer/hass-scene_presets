import React, {Component} from "react";

interface HaSwitchProps {
    value: boolean;
    onValueChanged: (value: boolean) => void
}

class HaSwitch extends Component<HaSwitchProps> {
    private elementRef: React.RefObject<HTMLInputElement>;

    constructor(props: HaSwitchProps) {
        super(props);

        this.elementRef = React.createRef();
    }

    handleValueChanged = () => {
        this.props.onValueChanged(this.elementRef.current!.checked);
    };

    componentDidMount() {
        this.elementRef.current!.addEventListener("change", this.handleValueChanged);
    }

    componentWillUnmount() {
        this.elementRef.current!.removeEventListener("change", this.handleValueChanged);
    }

    render() {
        return (
            <ha-switch
                style={{verticalAlign: "text-top"}}
                ref={this.elementRef}
                checked={this.props.value}
            />
        );
    }

}

export default HaSwitch;
