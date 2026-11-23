import { Children, Fragment, isValidElement, type ReactNode } from "react";

interface OptionProps {
  children?: ReactNode;
  value?: string | number;
  label?: string;
  disabled?: boolean;
  hidden?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled: boolean;
  hidden: boolean;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

/** Native option markup is the shared source for the visible list and submitted value. */
export function readSelectOptions(
  children: ReactNode,
): (SelectOption | SelectGroup)[] {
  return Children.toArray(children).flatMap(
    (child): (SelectOption | SelectGroup)[] => {
      if (!isValidElement<OptionProps>(child)) return [];
      const {
        children: content,
        disabled = false,
        hidden = false,
        label,
        value,
      } = child.props;
      if (child.type === Fragment) return readSelectOptions(content);
      if (child.type === "optgroup") {
        const options = readSelectOptions(content).flatMap((item) =>
          "options" in item ? item.options : [item],
        );
        return [
          {
            label: label ?? "",
            options: options.map((option) => ({
              ...option,
              disabled: disabled || option.disabled,
              hidden: hidden || option.hidden,
            })),
          },
        ];
      }
      if (child.type !== "option") return [];
      const text = Children.toArray(content).join("");
      return [
        {
          value: String(value ?? text),
          label: label ?? text,
          disabled,
          hidden,
        },
      ];
    },
  );
}

// Radix reserves an empty value for its placeholder. Encoding all option values also
// supports a real empty option without collisions with application-provided strings.
export const encodeSelectValue = (value: string) => `option:${value}`;
export const decodeSelectValue = (value: string) =>
  value.slice("option:".length);
