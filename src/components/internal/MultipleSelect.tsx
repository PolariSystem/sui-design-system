import { AssetIcon } from "./AssetIcon";
import { useControlRef } from "./useControlRef";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { MultipleSelectProps } from "../Select.types";
import { Field } from "./Field";
import { CheckboxArtwork } from "./CheckboxArtwork";
import { readSelectOptions, type SelectOption } from "./selectOptions";
import {
  selectTriggerClass,
  selectItemClass,
  selectPopupClass,
} from "./selectPresentation";
import { useListboxNavigation } from "./useListboxNavigation";
import indicator from "../../assets/select-indicator.svg";

const emptyValues: string[] = [];

function writeNativeValues(select: HTMLSelectElement, values: string[]) {
  const selected = new Set(values);
  for (const option of select.options)
    option.selected = selected.has(option.value);
}

/** A non-modal listbox: toggling options keeps it open and outside interaction dismisses it. */
export function MultipleSelect({
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
  placeholder = "Select options",
  onChange,
  onValueChange,
  onInvalid,
  onFocus,
  triggerProps,
  autoFocus,
  "aria-describedby": describedBy,
  ...props
}: MultipleSelectProps) {
  const native = useRef<HTMLSelectElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const triggerRef = useControlRef(trigger, triggerProps?.ref);
  const openingEdge = useRef<"first" | "last" | undefined>(undefined);
  const leavingByTab = useRef(false);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? emptyValues,
  );
  const [focusedValue, setFocusedValue] = useState<string>();
  const navigation = useListboxNavigation();
  const groups = readSelectOptions(children);
  const options = groups.flatMap((item) =>
    "options" in item ? item.options : [item],
  );
  const controlled = value !== undefined;
  const selected = new Set(value ?? internalValue);
  const selectedOptions = options.filter((option) =>
    selected.has(option.value),
  );
  const current = selectedOptions.map((option) => option.value);
  const latestValue = useRef(current);
  latestValue.current = current;
  const text = selectedOptions.map((option) => option.label).join(", ");
  useImperativeHandle(ref, () => native.current!, []);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  useEffect(() => {
    const form = native.current?.form;
    const reset = (event: Event) => {
      // Reset is cancelable and must not emit selection changes. Read the latest value
      // after the parent's onReset has had a chance to restore controlled state.
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        const next = controlled
          ? latestValue.current
          : (defaultValue ?? emptyValues);
        if (!controlled) setInternalValue(next);
        if (native.current) writeNativeValues(native.current, next);
        setOpen(false);
      });
    };
    form?.addEventListener("reset", reset, true);
    return () => form?.removeEventListener("reset", reset, true);
  }, [controlled, defaultValue, props.form]);

  const toggle = (option: SelectOption) => {
    if (disabled || option.disabled || !native.current) return;
    const next = new Set(current);
    if (next.has(option.value)) next.delete(option.value);
    else next.add(option.value);
    // Use one real native change event, including all selectedOptions, for form libraries.
    writeNativeValues(native.current, [...next]);
    native.current.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const renderOption = (option: SelectOption) => {
    if (option.hidden || (option.disabled && option.value === "")) return null;
    const checked = selected.has(option.value);
    return (
      <div
        key={option.value}
        role="option"
        aria-selected={checked}
        aria-disabled={option.disabled || undefined}
        tabIndex={!option.disabled && focusedValue === option.value ? 0 : -1}
        data-state={checked ? "checked" : "unchecked"}
        data-disabled={option.disabled ? "" : undefined}
        data-highlighted={
          !option.disabled && focusedValue === option.value ? "" : undefined
        }
        className={selectItemClass}
        onFocus={() => setFocusedValue(option.value)}
        onBlur={() => setFocusedValue(undefined)}
        onPointerMove={(event) => {
          if (!option.disabled && event.pointerType === "mouse")
            event.currentTarget.focus({ preventScroll: true });
        }}
        onClick={(event) => {
          if (!option.disabled)
            event.currentTarget.focus({ preventScroll: true });
          toggle(option);
        }}
        onKeyDown={(event) => {
          if (
            !event.nativeEvent.isComposing &&
            (event.key === " " || event.key === "Enter")
          ) {
            event.preventDefault();
            event.stopPropagation();
            if (!event.repeat) toggle(option);
          }
        }}
      >
        <span className="break-words">{option.label}</span>
        {/* Options expose aria-selected; a nested interactive checkbox would create two controls. */}
        <span
          aria-hidden="true"
          className="sui-selection-indicator relative ml-auto inline-flex size-5 shrink-0"
          data-checked={checked}
          data-disabled={option.disabled}
        >
          <CheckboxArtwork disabled={option.disabled} />
        </span>
      </div>
    );
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
        <div className="sui-select-control relative min-w-0">
          <select
            {...props}
            ref={native}
            id={`${control.id}-native`}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            multiple
            required={required}
            disabled={disabled}
            value={current}
            onChange={(event) => {
              const next = Array.from(
                event.currentTarget.selectedOptions,
                (option) => option.value,
              );
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
          <Popover.Root open={open && !disabled} onOpenChange={setOpen}>
            <Popover.Trigger
              {...triggerProps}
              {...control}
              ref={triggerRef}
              role="combobox"
              aria-haspopup="listbox"
              aria-label={props["aria-label"]}
              aria-labelledby={props["aria-labelledby"]}
              aria-invalid={error ? true : props["aria-invalid"]}
              aria-required={required || undefined}
              disabled={disabled}
              autoFocus={autoFocus}
              data-error={Boolean(error)}
              data-disabled={Boolean(disabled)}
              className={`${selectTriggerClass} ${triggerProps?.className ?? ""}`}
              onKeyDown={(event) => {
                triggerProps?.onKeyDown?.(event);
                if (
                  !event.defaultPrevented &&
                  (event.key === "ArrowDown" || event.key === "ArrowUp")
                ) {
                  event.preventDefault();
                  openingEdge.current =
                    event.key === "ArrowUp" ? "last" : "first";
                  setOpen(true);
                }
              }}
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
                {text || placeholder}
              </span>
              <AssetIcon
                src={indicator}
                className="sui-select-indicator size-5 shrink-0"
              />
              {rightIcon && (
                <span
                  aria-hidden="true"
                  className="flex size-5 shrink-0 items-center justify-center"
                >
                  {rightIcon}
                </span>
              )}
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                ref={navigation.content}
                role="listbox"
                aria-label={props["aria-label"] ?? label}
                aria-labelledby={props["aria-labelledby"]}
                aria-multiselectable="true"
                aria-describedby={control["aria-describedby"]}
                tabIndex={-1}
                align="start"
                sideOffset={8}
                collisionPadding={8}
                dir={props.dir}
                className={`${selectPopupClass} sui-multi-select-popup`}
                onOpenAutoFocus={(event) => {
                  event.preventDefault();
                  navigation.focusInitial(openingEdge.current);
                  openingEdge.current = undefined;
                }}
                onCloseAutoFocus={(event) => {
                  if (leavingByTab.current) event.preventDefault();
                  leavingByTab.current = false;
                }}
                onKeyDown={(event) => {
                  if (event.key === "Tab") {
                    // Return to the trigger's document position before native Tab continues.
                    // This keeps a portal from sending focus to the end of the page.
                    leavingByTab.current = true;
                    trigger.current?.focus();
                    setOpen(false);
                  } else navigation.onKeyDown(event);
                }}
              >
                <div className="sui-select-viewport">
                  {groups.map((item, index) =>
                    "options" in item ? (
                      <div
                        key={`group-${index}`}
                        role="group"
                        aria-label={item.label}
                      >
                        {item.options.map(renderOption)}
                      </div>
                    ) : (
                      renderOption(item)
                    ),
                  )}
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      )}
    </Field>
  );
}
