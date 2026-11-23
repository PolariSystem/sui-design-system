import { AssetIcon } from "./AssetIcon";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Field } from "./Field";
import type { SingleSelectProps } from "../Select.types";
import {
  readSelectOptions,
  encodeSelectValue,
  decodeSelectValue,
  type SelectOption,
} from "./selectOptions";
import {
  selectTriggerClass,
  selectItemClass,
  selectPopupClass,
} from "./selectPresentation";
import indicator from "../../assets/select-indicator.svg";
import unread from "../../assets/unread-bold.svg";

function Option({ option }: { option: SelectOption }) {
  if (option.hidden || (option.disabled && option.value === "")) return null;
  return (
    <SelectPrimitive.Item
      value={encodeSelectValue(option.value)}
      disabled={option.disabled}
      textValue={option.label}
      // The native form bridge emits the change; prevent a second encoded change
      // from the primitive's unnamed form control, including capture listeners.
      onClick={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") event.stopPropagation();
      }}
      className={selectItemClass}
    >
      <SelectPrimitive.ItemText>
        <span className="break-words">{option.label}</span>
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        className="ml-auto flex size-5 shrink-0"
        aria-hidden="true"
      >
        <img src={unread} alt="" width={20} height={20} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

/** Figma selection menu with managed focus, typeahead and native form participation. */
export function SingleSelect({
  multiple: _multiple,
  label,
  hideLabel,
  helperText,
  error,
  id,
  required,
  disabled,
  className,
  leftIcon,
  rightIcon,
  children,
  ref,
  value,
  defaultValue,
  onChange,
  onValueChange,
  onInvalid,
  onFocus,
  triggerProps,
  "aria-describedby": describedBy,
  ...props
}: SingleSelectProps) {
  const native = useRef<HTMLSelectElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const resetting = useRef(false);
  const [open, setOpen] = useState(false);
  const groups = readSelectOptions(children);
  const options = groups.flatMap((item) =>
    "options" in item ? item.options : [item],
  );
  const fallback = options.find((option) => !option.disabled)?.value ?? "";
  const [internalValue, setInternalValue] = useState(defaultValue ?? fallback);
  const controlled = value !== undefined;
  const requested = value ?? internalValue;
  const selected = options.find((option) => option.value === requested);
  const current = selected?.value ?? fallback;
  const latestValue = useRef(current);
  latestValue.current = current;
  const text = options.find((option) => option.value === current)?.label ?? "";
  useImperativeHandle(ref, () => native.current!, []);

  useEffect(() => {
    const form = native.current?.form;
    // Capture before the behavior primitive's reset listener. Native reset is cancelable;
    // it must not emit a user change or override a controlled value.
    const reset = (event: Event) => {
      resetting.current = true;
      queueMicrotask(() => {
        resetting.current = false;
        if (!event.defaultPrevented) {
          if (!controlled) setInternalValue(defaultValue ?? fallback);
          if (native.current)
            native.current.value = controlled
              ? latestValue.current
              : (defaultValue ?? fallback);
          setOpen(false);
        }
      });
    };
    form?.addEventListener("reset", reset, true);
    return () => form?.removeEventListener("reset", reset, true);
  }, [controlled, current, defaultValue, fallback, props.form]);

  const choose = (encoded: string) => {
    if (resetting.current) return;
    const next = decodeSelectValue(encoded);
    if (!native.current || next === current) return;
    // Dispatch through the native control instead of inventing a React change event.
    // This preserves form libraries, event bubbling and the existing onChange contract.
    native.current.value = next;
    native.current.dispatchEvent(new Event("change", { bubbles: true }));
  };

  return (
    <Field
      {...{
        label,
        hideLabel,
        helperText,
        error,
        id,
        required,
        disabled,
        className,
        describedBy,
      }}
      labelTone="body"
    >
      {(control) => (
        <div
          className="sui-select-control relative min-w-0"
          onChange={(event) => {
            // Radix's unnamed form bridge uses encoded values. Only our native control
            // may notify the parent form, using the application's original value.
            if ((event.target as EventTarget) !== native.current)
              event.stopPropagation();
          }}
        >
          <select
            {...props}
            ref={native}
            id={`${control.id}-native`}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            required={required}
            disabled={disabled}
            value={current}
            onChange={(event) => {
              const next = event.currentTarget.value;
              if (!controlled) setInternalValue(next);
              onChange?.(event);
              onValueChange?.(next);
            }}
            onFocus={(event) => {
              onFocus?.(event);
              trigger.current?.focus();
            }}
            onInvalid={(event) => {
              onInvalid?.(event);
              if (!event.defaultPrevented) {
                event.preventDefault();
                trigger.current?.focus();
              }
            }}
          >
            {children}
          </select>
          <SelectPrimitive.Root
            value={encodeSelectValue(current)}
            onValueChange={choose}
            open={open}
            onOpenChange={setOpen}
            disabled={disabled}
            required={required}
            dir={props.dir === "rtl" ? "rtl" : "ltr"}
          >
            <SelectPrimitive.Trigger
              {...triggerProps}
              {...control}
              ref={(element) => {
                trigger.current = element;
                const forwarded = triggerProps?.ref;
                if (typeof forwarded === "function") return forwarded(element);
                if (forwarded) forwarded.current = element;
              }}
              aria-label={props["aria-label"]}
              aria-labelledby={props["aria-labelledby"]}
              aria-invalid={error ? true : props["aria-invalid"]}
              autoFocus={props.autoFocus}
              data-error={Boolean(error)}
              data-disabled={Boolean(disabled)}
              className={`${selectTriggerClass} ${triggerProps?.className ?? ""}`}
            >
              {leftIcon && (
                <span
                  aria-hidden="true"
                  className="flex size-4 shrink-0 items-center justify-center"
                >
                  {leftIcon}
                </span>
              )}
              <span className="min-w-0 flex-1 break-words">
                <SelectPrimitive.Value>{text}</SelectPrimitive.Value>
              </span>
              <SelectPrimitive.Icon asChild>
                <AssetIcon
                  src={indicator}
                  className="sui-select-indicator size-5 shrink-0"
                />
              </SelectPrimitive.Icon>
              {rightIcon && (
                <span
                  aria-hidden="true"
                  className="flex size-5 shrink-0 items-center justify-center"
                >
                  {rightIcon}
                </span>
              )}
            </SelectPrimitive.Trigger>
            <SelectPrimitive.Portal>
              <SelectPrimitive.Content
                aria-label={props["aria-label"] ?? label}
                position="popper"
                sideOffset={8}
                collisionPadding={8}
                className={selectPopupClass}
              >
                <SelectPrimitive.ScrollUpButton
                  className="sui-select-scroll flex h-6 items-center justify-center"
                  aria-hidden="true"
                >
                  <AssetIcon src={indicator} className="size-5 rotate-180" />
                </SelectPrimitive.ScrollUpButton>
                <SelectPrimitive.Viewport className="sui-select-viewport">
                  {groups.map((item, index) =>
                    "options" in item ? (
                      <SelectPrimitive.Group
                        key={`group-${index}`}
                        aria-label={item.label}
                      >
                        {item.options.map((option) => (
                          <Option key={option.value} option={option} />
                        ))}
                      </SelectPrimitive.Group>
                    ) : (
                      <Option key={item.value} option={item} />
                    ),
                  )}
                </SelectPrimitive.Viewport>
                <SelectPrimitive.ScrollDownButton
                  className="sui-select-scroll flex h-6 items-center justify-center"
                  aria-hidden="true"
                >
                  <AssetIcon src={indicator} className="size-5" />
                </SelectPrimitive.ScrollDownButton>
              </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
          </SelectPrimitive.Root>
        </div>
      )}
    </Field>
  );
}
