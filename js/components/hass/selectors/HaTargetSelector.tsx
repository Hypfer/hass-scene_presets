import HaSelector, {HaSelectorProps} from "./HaSelector";

export interface HaTargetSelectorValue {
    entity_id?: string | Array<string>,
    device_id?: string | Array<string>,
    area_id?: string | Array<string>
}

export interface HaTargetSelectorProps extends HaSelectorProps {
    value: HaTargetSelectorValue
    onValueChanged: (value: HaTargetSelectorValue) => void
}

export class HaTargetSelector extends HaSelector<HaTargetSelectorProps> {}
