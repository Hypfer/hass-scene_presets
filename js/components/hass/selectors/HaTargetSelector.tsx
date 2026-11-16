import HaSelector, {HaSelectorProps} from "./HaSelector";

export interface HaTargetSelectorValue {
    entity_id?: string | Array<string>,
    device_id?: string | Array<string>,
    area_id?: string | Array<string>,
    floor_id?: string | Array<string>,
    label_id?: string | Array<string>,
    exclude?: HaTargetSelectorValue
}

export interface HaTargetSelectorProps extends HaSelectorProps {
    value: HaTargetSelectorValue
    onValueChanged: (value: HaTargetSelectorValue) => void
}

export class HaTargetSelector extends HaSelector<HaTargetSelectorProps> {}
