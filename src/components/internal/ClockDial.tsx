import { useId, useLayoutEffect, useRef, type PointerEvent } from "react";

interface ClockDialProps {
  stage: "hour" | "minute";
  format: "12h" | "24h";
  value: number;
  minuteStep: number;
  available: (value: number) => boolean;
  onChange: (value: number) => void;
  onComplete: () => void;
  onGestureStart: () => void;
  onGestureCancel: () => void;
}

/** Pointer coordinates are proportional geometry. The inner ring contains 00 and 13–23. */
export function clockValue(
  x: number,
  y: number,
  size: number,
  stage: "hour" | "minute",
  format: "12h" | "24h",
  step: number,
) {
  const dx = x - size / 2,
    dy = y - size / 2;
  const turn = (Math.atan2(dx, -dy) / (Math.PI * 2) + 1) % 1;
  if (stage === "minute") return (Math.round((turn * 60) / step) * step) % 60;
  const hour = Math.round(turn * 12) % 12;
  if (format === "24h" && Math.hypot(dx, dy) < (size * 84) / 256)
    return hour === 0 ? 0 : hour + 12;
  return hour || 12;
}

/** One accessible slider avoids overlapping tiny focus targets on the clock face. */
export function ClockDial({
  stage,
  format,
  value,
  minuteStep,
  available,
  onChange,
  onComplete,
  onGestureStart,
  onGestureCancel,
}: ClockDialProps) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<number | null>(null);
  const hint = useId();
  useLayoutEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, [stage]);
  const values =
    stage === "minute"
      ? Array.from({ length: 60 / minuteStep }, (_, i) => i * minuteStep)
      : Array.from({ length: format === "24h" ? 24 : 12 }, (_, i) =>
          format === "24h" ? i : i + 1,
        );
  const allowed = values.filter(available);
  const labels =
    stage === "minute" ? Array.from({ length: 12 }, (_, i) => i * 5) : values;
  const radius =
    stage === "hour" && format === "24h" && (value === 0 || value > 12)
      ? 64
      : 104;
  const angle = (stage === "minute" ? value / 60 : (value % 12) / 12) * 360;
  const point = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    return clockValue(
      event.clientX - box.left,
      event.clientY - box.top,
      box.width,
      stage,
      format,
      minuteStep,
    );
  };
  const select = (next: number) => {
    if (available(next)) {
      onChange(next);
      return true;
    }
    return false;
  };
  return (
    <>
      <p
        aria-live="polite"
        className="text-center text-sui-body-sm text-sui-text-secondary"
      >
        {stage === "hour" ? "Choose an hour" : "Choose a minute"}
      </p>
      <span id={hint} className="sr-only">
        Use arrow keys to adjust, Home or End for the first or last available
        value.
        {stage === "hour"
          ? " Press Enter to choose minutes."
          : " Tab to Apply to confirm."}
      </span>
      <div
        ref={ref}
        role="slider"
        aria-label={stage === "hour" ? "Hour" : "Minute"}
        aria-describedby={hint}
        aria-valuemin={values[0]}
        aria-valuemax={values.at(-1)}
        aria-valuenow={value}
        aria-valuetext={`${String(value).padStart(2, "0")} ${stage}${stage === "minute" ? "s" : ""}`}
        aria-disabled={!allowed.length || undefined}
        tabIndex={0}
        className="sui-clock-dial"
        onKeyDown={(event) => {
          let next: number | undefined;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (available(value)) onComplete();
            return;
          }
          if (["ArrowUp", "ArrowRight", "PageUp"].includes(event.key))
            next = allowed.find((n) => n > value);
          else if (["ArrowDown", "ArrowLeft", "PageDown"].includes(event.key))
            next = allowed.filter((n) => n < value).at(-1);
          else if (event.key === "Home") next = allowed[0];
          else if (event.key === "End") next = allowed.at(-1);
          else return;
          event.preventDefault();
          if (next !== undefined) onChange(next);
        }}
        onPointerDown={(event) => {
          if (event.button !== 0 || !event.isPrimary || !allowed.length) return;
          event.preventDefault();
          event.currentTarget.focus({ preventScroll: true });
          drag.current = event.pointerId;
          onGestureStart();
          event.currentTarget.setPointerCapture(event.pointerId);
          select(point(event));
        }}
        onPointerMove={(event) => {
          if (drag.current === event.pointerId) select(point(event));
        }}
        onPointerUp={(event) => {
          if (drag.current !== event.pointerId) return;
          const selected = select(point(event));
          drag.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);
          if (selected) onComplete();
        }}
        onPointerCancel={() => {
          if (drag.current !== null) onGestureCancel();
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <span
          aria-hidden
          className="sui-clock-hand"
          data-fine={stage === "minute" && value % 5 !== 0}
          style={{
            height: `${(radius / 256) * 100}%`,
            transform: `rotate(${angle}deg)`,
          }}
        />
        <span aria-hidden className="sui-clock-pivot" />
        {labels.map((label) => {
          const r =
            stage === "hour" && format === "24h" && (label === 0 || label > 12)
              ? 64
              : 104;
          const a =
            (stage === "minute" ? label / 60 : (label % 12) / 12) * Math.PI * 2;
          return (
            <span
              key={label}
              aria-hidden
              className="sui-clock-label"
              data-value={label}
              data-selected={label === value}
              data-disabled={!available(label)}
              style={{
                left: `${50 + ((Math.sin(a) * r) / 256) * 100}%`,
                top: `${50 - ((Math.cos(a) * r) / 256) * 100}%`,
              }}
            >
              {String(label).padStart(2, "0")}
            </span>
          );
        })}
      </div>
    </>
  );
}
