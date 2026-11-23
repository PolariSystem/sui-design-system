import { AssetIcon } from "./internal/AssetIcon";
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  addDays,
  addMonths,
  formatDate,
  parseDate,
  todayDate,
} from "./internal/dateTime";
import previous from "../assets/date-previous.svg";
import next from "../assets/date-next.svg";

export interface DateRange {
  start: string;
  end: string;
}
export interface DateCalendarProps {
  value?: string;
  range?: DateRange;
  mode?: "single" | "range";
  onSelect?: (date: string) => void;
  min?: string;
  max?: string;
  isDateUnavailable?: (date: string) => boolean;
  defaultMonth?: string;
  today?: string;
  locale?: string;
  autoFocus?: boolean;
}

/** Monday-first date grid. Focus and selection are independent; unavailable dates remain discoverable. */
export function DateCalendar({
  value,
  range,
  mode = "single",
  onSelect,
  min,
  max,
  isDateUnavailable,
  defaultMonth,
  today = todayDate(),
  locale = "en-GB",
  autoFocus = false,
}: DateCalendarProps) {
  const initial =
    [value, range?.start, defaultMonth, today].find((v) => v && parseDate(v)) ??
    todayDate();
  const [focused, setFocused] = useState(initial);
  const [month, setMonth] = useState(initial.slice(0, 7) + "-01");
  const grid = useRef<HTMLTableElement>(null);
  const moveFocus = useRef(autoFocus);
  const titleId = useId();
  const first = parseDate(month)!;
  const start = addDays(month, -((first.getUTCDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const unavailable = (day: string) =>
    Boolean(
      (min && day < min) || (max && day > max) || isDateUnavailable?.(day),
    );
  useLayoutEffect(() => {
    if (moveFocus.current) {
      grid.current
        ?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)
        ?.focus();
      moveFocus.current = false;
    }
  }, [focused, month]);
  const changeMonth = (offset: number) => {
    const nextMonth = addMonths(month, offset);
    const lastDay = parseDate(
      addDays(addMonths(nextMonth, 1), -1),
    )!.getUTCDate();
    const target = addDays(
      nextMonth,
      Math.min(parseDate(focused)!.getUTCDate(), lastDay) - 1,
    );
    setFocused(target);
    setMonth(target.slice(0, 7) + "-01");
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, day: string) => {
    const weekday = (parseDate(day)!.getUTCDay() + 6) % 7;
    let target: string | undefined;
    switch (event.key) {
      case "ArrowRight":
        target = addDays(day, 1);
        break;
      case "ArrowLeft":
        target = addDays(day, -1);
        break;
      case "ArrowDown":
        target = addDays(day, 7);
        break;
      case "ArrowUp":
        target = addDays(day, -7);
        break;
      case "Home":
        target = addDays(day, -weekday);
        break;
      case "End":
        target = addDays(day, 6 - weekday);
        break;
      case "PageUp":
        target = addMonths(day, event.shiftKey ? -12 : -1);
        break;
      case "PageDown":
        target = addMonths(day, event.shiftKey ? 12 : 1);
        break;
    }
    if (target) {
      event.preventDefault();
      moveFocus.current = true;
      setFocused(target);
      setMonth(target.slice(0, 7) + "-01");
    }
  };
  return (
    <div className="sui-date-calendar flex min-w-0 flex-col gap-4">
      <div className="flex items-center gap-2">
        <p
          id={titleId}
          aria-live="polite"
          className="min-w-0 flex-1 text-sui-heading-xs"
        >
          {formatDate(month, locale, { month: "long", year: "numeric" })}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous month"
            className="sui-calendar-navigation"
            onClick={() => changeMonth(-1)}
          >
            <AssetIcon src={previous} size={16} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            className="sui-calendar-navigation"
            onClick={() => changeMonth(1)}
          >
            <AssetIcon src={next} size={16} />
          </button>
        </div>
      </div>
      <table
        ref={grid}
        role="grid"
        aria-labelledby={titleId}
        aria-multiselectable={mode === "range" || undefined}
        className="w-full table-fixed border-separate border-spacing-y-1"
      >
        <thead>
          <tr>
            {Array.from({ length: 7 }, (_, i) => addDays("2026-10-12", i)).map(
              (day) => (
                <th
                  key={day}
                  scope="col"
                  className="py-2 text-sui-label-sm font-medium text-sui-text-secondary"
                >
                  <abbr
                    className="no-underline"
                    title={formatDate(day, locale, { weekday: "long" })}
                  >
                    {formatDate(day, locale, { weekday: "short" })}
                  </abbr>
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, week) => (
            <tr key={week}>
              {days.slice(week * 7, week * 7 + 7).map((day) => {
                const selected =
                  mode === "range"
                    ? Boolean(
                        range?.start &&
                        range?.end &&
                        day >= range.start &&
                        day <= range.end,
                      )
                    : day === value;
                const edge =
                  mode === "range" &&
                  (day === range?.start || day === range?.end);
                return (
                  <td
                    key={day}
                    role="gridcell"
                    aria-selected={selected || edge}
                    className="p-0"
                  >
                    <button
                      type="button"
                      data-date={day}
                      data-selected={selected || edge}
                      data-edge={edge}
                      data-range={selected && !edge && mode === "range"}
                      data-outside={day.slice(0, 7) !== month.slice(0, 7)}
                      aria-current={day === today ? "date" : undefined}
                      aria-disabled={unavailable(day) || undefined}
                      aria-label={formatDate(day, locale, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      tabIndex={day === focused ? 0 : -1}
                      className="sui-calendar-day"
                      onFocus={() => setFocused(day)}
                      onKeyDown={(event) => onKeyDown(event, day)}
                      onClick={() => {
                        if (!unavailable(day)) {
                          setMonth(day.slice(0, 7) + "-01");
                          onSelect?.(day);
                        }
                      }}
                    >
                      {parseDate(day)!.getUTCDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
