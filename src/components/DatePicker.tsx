import { useState } from "react";
import { Button } from "./Button";
import { CardFooter } from "./Card";
import { DateCalendar, type DateRange } from "./DateCalendar";
import { PickerField, type PickerFieldProps } from "./internal/PickerField";
import { usePickerValue } from "./internal/usePickerValue";
import { addDays, formatDate, parseDate } from "./internal/dateTime";
import calendarIcon from "../assets/date-calendar.svg";

interface DatePickerBase extends PickerFieldProps {
  min?: string;
  max?: string;
  isDateUnavailable?: (date: string) => boolean;
  defaultMonth?: string;
  locale?: string;
  applyLabel?: string;
  clearLabel?: string;
}
export type DatePickerProps = DatePickerBase &
  (
    | {
        mode?: "single";
        value?: string;
        defaultValue?: string;
        onValueChange?: (value: string) => void;
      }
    | {
        mode: "range";
        value?: DateRange;
        defaultValue?: DateRange;
        onValueChange?: (value: DateRange) => void;
      }
  );
const emptyRange: DateRange = { start: "", end: "" };

/** ISO date values are committed only by Apply. Range form values use start/end names. */
export function DatePicker(props: DatePickerProps) {
  const {
    mode = "single",
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    isDateUnavailable,
    defaultMonth,
    locale = "en-GB",
    applyLabel = "Apply",
    clearLabel = "Clear",
    ...field
  } = props;
  const state = usePickerValue<string | DateRange>(
    value,
    defaultValue ?? (mode === "range" ? emptyRange : ""),
    (next) => {
      if (props.mode === "range") props.onValueChange?.(next as DateRange);
      else props.onValueChange?.(next as string);
    },
  );
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(state.current);
  state.resetRef.current = () => setOpen(false);
  const range = mode === "range" ? (draft as DateRange) : undefined;
  const single = mode === "single" ? (draft as string) : undefined;
  const unavailable = (date: string) =>
    !parseDate(date) ||
    Boolean(
      (min && date < min) || (max && date > max) || isDateUnavailable?.(date),
    );
  const valid = (selection: string | DateRange): boolean => {
    if (typeof selection === "string")
      return !selection || !unavailable(selection);
    if (!selection.start && !selection.end) return true;
    if (
      !selection.start ||
      !selection.end ||
      selection.start > selection.end ||
      unavailable(selection.start) ||
      unavailable(selection.end)
    )
      return false;
    // Ranges may not silently span unavailable dates. Bound iteration to the supported ISO date domain.
    if (isDateUnavailable)
      for (
        let day = selection.start;
        day < selection.end;
        day = addDays(day, 1)
      )
        if (isDateUnavailable(day)) return false;
    return true;
  };
  const display = (selection: string | DateRange) =>
    typeof selection === "string"
      ? formatDate(selection, locale)
      : [formatDate(selection.start, locale), formatDate(selection.end, locale)]
          .filter(Boolean)
          .join(" – ");
  const currentRange =
    typeof state.current === "object" ? state.current : undefined;
  const serialized =
    typeof state.current === "string"
      ? state.current
      : state.current.start && state.current.end
        ? `${state.current.start}/${state.current.end}`
        : "";
  return (
    <>
      <PickerField
        {...field}
        name={mode === "range" ? undefined : field.name}
        icon={calendarIcon}
        placeholder={
          field.placeholder ??
          (mode === "range" ? "Choose a date range" : "Choose a date")
        }
        inputRef={state.inputRef}
        displayValue={display(state.current)}
        serializedValue={serialized}
        validationMessage={
          valid(state.current)
            ? ""
            : "Choose an available date or complete range."
        }
        open={open}
        onOpenChange={(next) => {
          if (next) setDraft(state.current);
          setOpen(next);
        }}
      >
        <DateCalendar
          key={open ? "open" : "closed"}
          autoFocus
          mode={mode}
          value={single}
          range={range}
          min={min}
          max={max}
          isDateUnavailable={isDateUnavailable}
          defaultMonth={defaultMonth}
          locale={locale}
          onSelect={(day) => {
            if (mode === "single") setDraft(day);
            else if (!range?.start || range.end || day < range.start)
              setDraft({ start: day, end: "" });
            else setDraft({ start: range.start, end: day });
          }}
        />
        <div className="sui-picker-summary" role="status">
          {display(draft) || "No date selected"}
        </div>
        <CardFooter>
          <Button
            disabled={!valid(draft)}
            onClick={() => {
              state.commit(draft);
              setOpen(false);
            }}
          >
            {applyLabel}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setDraft(mode === "range" ? emptyRange : "")}
          >
            {clearLabel}
          </Button>
        </CardFooter>
      </PickerField>
      {mode === "range" && field.name && (
        <>
          <input
            type="hidden"
            name={`${field.name}.start`}
            form={field.form}
            disabled={field.disabled}
            value={currentRange?.start ?? ""}
          />
          <input
            type="hidden"
            name={`${field.name}.end`}
            form={field.form}
            disabled={field.disabled}
            value={currentRange?.end ?? ""}
          />
        </>
      )}
    </>
  );
}
