import HaSelector, {HaSelectorProps} from "./HaSelector";

export interface HaNumberSelectorProps extends HaSelectorProps {
    value: number
    onValueChanged: (value: number) => void
}

export class HaNumberSelector extends HaSelector<HaNumberSelectorProps> {}
