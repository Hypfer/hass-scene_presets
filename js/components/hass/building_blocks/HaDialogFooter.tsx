import React, {Component, ReactNode} from "react";

interface HaDialogFooterProps {
    children?: ReactNode;
    slot?: string;
}

class HaDialogFooter extends Component<HaDialogFooterProps> {
    render() {
        return (
            <ha-dialog-footer
                slot={this.props.slot}
            >
                {this.props.children}
            </ha-dialog-footer>
        );
    }

}

export default HaDialogFooter;
