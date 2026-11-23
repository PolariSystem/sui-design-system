import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { CardFooter } from "./Card";
import { PickerField, type PickerFieldProps } from "./internal/PickerField";
import { ClockDial } from "./internal/ClockDial";
import { usePickerValue } from "./internal/usePickerValue";
import { formatTime, parseTime, timeValue } from "./internal/dateTime";
import clock from "../assets/time-clock.svg";

export interface TimePickerProps extends PickerFieldProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Preferred display format; changing it never changes the HH:mm value. */
  format?: "12h" | "24h";
  allowFormatSwitch?: boolean;
  onFormatChange?: (format: "12h" | "24h") => void;
  minuteStep?: 1 | 5 | 10 | 15 | 20 | 30;
  min?: string;
  max?: string;
  applyLabel?: string;
  cancelLabel?: string;
}

/** Select an hour, then minutes on a clock. Apply is the only operation that commits a time. */
export function TimePicker({
  value,
  defaultValue = "",
  onValueChange,
  format = "24h",
  allowFormatSwitch = true,
  onFormatChange,
  minuteStep = 1,
  min,
  max,
  applyLabel = "Apply",
  cancelLabel = "Cancel",
  ...field
}: TimePickerProps) {
  if (
    ![1, 5, 10, 15, 20, 30].includes(minuteStep) ||
    (min !== undefined && parseTime(min) === undefined) ||
    (max !== undefined && parseTime(max) === undefined) ||
    (min && max && min > max)
  )
    throw new RangeError(
      "TimePicker requires a supported minute step and increasing HH:mm bounds within one day.",
    );
  const state = usePickerValue(value, defaultValue, onValueChange);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("00:00");
  const gestureDraft = useRef(draft);
  const [stage, setStage] = useState<"hour" | "minute">("hour");
  const [displayFormat, setDisplayFormat] = useState(format);
  useEffect(() => setDisplayFormat(format), [format]);
  state.resetRef.current = () => setOpen(false);
  const lower = parseTime(min ?? "") ?? 0,
    upper = parseTime(max ?? "") ?? 1439;
  const allowed = (n: number) =>
    n >= lower && n <= upper && n % minuteStep === 0;
  const allTimes = Array.from(
    { length: 1440 / minuteStep },
    (_, i) => i * minuteStep,
  );
  const minutes = Array.from(
    { length: 60 / minuteStep },
    (_, i) => i * minuteStep,
  );
  const current = parseTime(draft) ?? 0,
    hour = Math.floor(current / 60),
    minute = current % 60;
  const actualHour = (h: number) =>
    displayFormat === "12h" ? (h % 12) + (hour >= 12 ? 12 : 0) : h;
  const availableHour = (h: number) =>
    minutes.some((m) => allowed(actualHour(h) * 60 + m));
  const chooseHour = (h: number) => {
    const base = actualHour(h) * 60;
    const next = allowed(base + minute)
      ? base + minute
      : base + (minutes.find((m) => allowed(base + m)) ?? 0);
    if (allowed(next)) setDraft(timeValue(next));
  };
  const changePeriod = (period: number) => {
    const candidate = (hour % 12) * 60 + minute + period * 720;
    const next = allowed(candidate)
      ? candidate
      : allTimes.find((n) => Math.floor(n / 720) === period && allowed(n));
    if (next !== undefined) setDraft(timeValue(next));
  };
  return (
    <PickerField
      {...field}
      icon={clock}
      placeholder={field.placeholder ?? "Choose a time"}
      displayValue={formatTime(state.current, displayFormat)}
      serializedValue={state.current}
      validationMessage={
        state.current &&
        (parseTime(state.current) === undefined ||
          !allowed(parseTime(state.current)!))
          ? "Choose an available time at the configured minute interval."
          : ""
      }
      inputRef={state.inputRef}
      open={open}
      onOpenChange={(next) => {
        if (next) {
          const currentValue = parseTime(state.current);
          setDraft(
            currentValue !== undefined && allowed(currentValue)
              ? state.current
              : timeValue(allTimes.find(allowed) ?? 0),
          );
          setStage("hour");
        }
        setOpen(next);
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="flex-1 text-sui-heading-xs">Select time</p>
        {allowFormatSwitch ? (
          <div role="group" aria-label="Time format" className="flex gap-2">
            {(["12h", "24h"] as const).map((option) => (
              <button
                key={option}
                type="button"
                className="sui-time-toggle"
                aria-label={
                  option === "12h" ? "12-hour format" : "24-hour format"
                }
                aria-pressed={displayFormat === option}
                onClick={() => {
                  setDisplayFormat(option);
                  onFormatChange?.(option);
                }}
              >
                {option === "12h" ? "12 h" : "24 h"}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-sui-caption-md">
            {displayFormat === "12h" ? "12 h" : "24 h"}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="sui-time-toggle sui-time-readout"
          aria-label="Choose hours"
          aria-pressed={stage === "hour"}
          onClick={() => setStage("hour")}
        >
          {String(displayFormat === "12h" ? hour % 12 || 12 : hour).padStart(
            2,
            "0",
          )}
        </button>
        <span aria-hidden className="text-sui-heading-sm">
          :
        </span>
        <button
          type="button"
          className="sui-time-toggle sui-time-readout"
          aria-label="Choose minutes"
          aria-pressed={stage === "minute"}
          onClick={() => setStage("minute")}
        >
          {String(minute).padStart(2, "0")}
        </button>
        {displayFormat === "12h" && (
          <div role="group" aria-label="Period" className="flex gap-2">
            {["AM", "PM"].map((period, i) => (
              <button
                key={period}
                type="button"
                className="sui-time-toggle"
                aria-pressed={Math.floor(hour / 12) === i}
                disabled={
                  !allTimes.some((n) => Math.floor(n / 720) === i && allowed(n))
                }
                onClick={() => changePeriod(i)}
              >
                {period}
              </button>
            ))}
          </div>
        )}
      </div>
      <ClockDial
        stage={stage}
        format={displayFormat}
        value={
          stage === "hour"
            ? displayFormat === "12h"
              ? hour % 12 || 12
              : hour
            : minute
        }
        minuteStep={minuteStep}
        available={
          stage === "hour" ? availableHour : (m) => allowed(hour * 60 + m)
        }
        onChange={
          stage === "hour"
            ? chooseHour
            : (m) => setDraft(timeValue(hour * 60 + m))
        }
        onComplete={() => {
          if (stage === "hour") setStage("minute");
        }}
        // Bounds can adjust minutes when the hour changes; restore the entire draft on cancellation.
        onGestureStart={() => {
          gestureDraft.current = draft;
        }}
        onGestureCancel={() => setDraft(gestureDraft.current)}
      />
      <div role="status" className="sui-picker-summary">
        {formatTime(draft, displayFormat)}
      </div>
      <CardFooter>
        <Button
          disabled={!allowed(current)}
          onClick={() => {
            state.commit(draft);
            setOpen(false);
          }}
        >
          {applyLabel}
        </Button>
        <Button variant="secondary" onClick={() => setOpen(false)}>
          {cancelLabel}
        </Button>
      </CardFooter>
    </PickerField>
  );
}
