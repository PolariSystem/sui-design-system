import { SingleSelect } from "./internal/SingleSelect";
import { MultipleSelect } from "./internal/MultipleSelect";
import type { SelectProps } from "./Select.types";

export type {
  SelectProps,
  SingleSelectProps,
  MultipleSelectProps,
} from "./Select.types";

/**
 * An items-only Figma selection menu backed by a native form control.
 * Single selection closes on choice; multiple selection stays open while toggling.
 */
export function Select(props: SelectProps) {
  return props.multiple ? (
    <MultipleSelect {...props} />
  ) : (
    <SingleSelect {...props} />
  );
}
