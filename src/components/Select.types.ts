import type { ComponentPropsWithRef, ReactNode } from "react";
import type { FieldProps } from "./internal/Field";

interface SelectBaseProps
  extends
    Omit<
      ComponentPropsWithRef<"select">,
      "size" | "multiple" | "value" | "defaultValue"
    >,
    FieldProps {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Visible trigger events/ref. The component ref remains the native form select. */
  triggerProps?: Omit<
    ComponentPropsWithRef<"button">,
    "children" | "id" | "disabled" | "type" | "role"
  >;
}

export interface SingleSelectProps extends SelectBaseProps {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  /** Receives the submitted string; onChange remains a native select change event. */
  onValueChange?: (value: string) => void;
}

export interface MultipleSelectProps extends SelectBaseProps {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  /** Displayed only when no options are selected; never rendered inside the popup. */
  placeholder?: string;
  /** Receives selected values in option order. Native forms omit disabled options. */
  onValueChange?: (value: string[]) => void;
}

export type SelectProps = SingleSelectProps | MultipleSelectProps;
