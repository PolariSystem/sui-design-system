import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import {
  addDays,
  formatDate,
  parseDate,
  parseTime,
  timeValue,
  todayDate,
} from "./internal/dateTime";
import meeting from "../assets/calendar-meeting.svg";
import successMeeting from "../assets/calendar-meeting-success.svg";
import note from "../assets/calendar-note.svg";

export interface CalendarEvent {
  id: string;
  date: string;
  start: string;
  end: string;
  title: string;
  type?: "meeting" | "note";
  tone?: "default" | "success";
  initials?: string;
}
export interface CalendarProps {
  /** ISO date for the first visible day. The standard workweek displays five days. */
  startDate: string;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  today?: string;
  locale?: string;
  startHour?: number;
  endHour?: number;
  label?: string;
}

/** Weekly planner with a chronological agenda on narrow screens. Events remain ordinary named buttons. */
export function Calendar({
  startDate,
  events,
  onEventClick,
  today = todayDate(),
  locale = "en-GB",
  startHour = 9,
  endHour = 16,
  label = "Weekly calendar",
}: CalendarProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [crowded, setCrowded] = useState(false);
  // Keep every title readable. If growing text collides with another card or
  // exceeds the time grid, use the same complete agenda offered on mobile.
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const measure = () => {
      if (!grid.getBoundingClientRect().width) return;
      const columns = [
        ...grid.querySelectorAll<HTMLElement>(".sui-calendar-day-column"),
      ];
      setCrowded(
        columns.some((column) => {
          const bounds = column.getBoundingClientRect();
          const cards = [...column.querySelectorAll(".sui-calendar-event")].map(
            (card) => card.getBoundingClientRect(),
          );
          return cards.some(
            (card, index) =>
              card.bottom > bounds.bottom ||
              cards
                .slice(index + 1)
                .some(
                  (other) =>
                    card.left < other.right &&
                    card.right > other.left &&
                    card.top < other.bottom &&
                    card.bottom > other.top,
                ),
          );
        }),
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    grid
      .querySelectorAll(".sui-calendar-event")
      .forEach((card) => observer.observe(card));
    measure();
    return () => observer.disconnect();
  }, [events, startDate, startHour, endHour, locale]);
  if (
    !parseDate(startDate) ||
    !Number.isInteger(startHour) ||
    !Number.isInteger(endHour) ||
    startHour < 0 ||
    endHour > 24 ||
    startHour >= endHour
  )
    throw new RangeError(
      "Calendar requires a valid start date and increasing whole-hour bounds within 0..24.",
    );
  const days = Array.from({ length: 5 }, (_, i) => addDays(startDate, i));
  const visible = events.filter(
    (event) =>
      days.includes(event.date) &&
      parseTime(event.start) !== undefined &&
      parseTime(event.end) !== undefined &&
      parseTime(event.end)! > parseTime(event.start)!,
  );
  const agenda =
    crowded ||
    visible.some(
      (event) =>
        parseTime(event.start)! < startHour * 60 ||
        parseTime(event.end)! > endHour * 60,
    );
  const card = (event: CalendarEvent) => {
    const content = (
      <>
        <span className="flex items-center gap-2 text-sui-calendar-type">
          <img
            src={
              event.type === "note"
                ? note
                : event.tone === "success"
                  ? successMeeting
                  : meeting
            }
            alt=""
          />
          {event.type === "note" ? "Note" : "Meeting"}
        </span>
        <span className="text-sui-calendar-title text-sui-text-primary">
          {event.title}
        </span>
        <span className="text-sui-caption-sm text-sui-text-secondary">
          {event.start} – {event.end}
        </span>
        {event.initials && (
          <span aria-hidden className="sui-event-avatar">
            {event.initials}
          </span>
        )}
      </>
    );
    const className = `sui-calendar-event ${event.type === "note" ? "sui-calendar-note" : event.tone === "success" ? "sui-calendar-success" : ""}`;
    return onEventClick ? (
      <button
        type="button"
        className={className}
        onClick={() => onEventClick(event)}
        aria-label={`${event.title}, ${formatDate(event.date, locale)}, ${event.start} to ${event.end}`}
      >
        {content}
      </button>
    ) : (
      <div className={className}>{content}</div>
    );
  };
  return (
    <section
      aria-label={label}
      data-agenda={agenda}
      className="sui-week-calendar font-sui"
    >
      <div
        ref={gridRef}
        inert={agenda}
        aria-hidden={agenda || undefined}
        className="sui-calendar-scroll"
        role="region"
        aria-label={`${label} time grid`}
        tabIndex={0}
      >
        <div
          className="sui-calendar-week"
          style={
            { "--sui-calendar-hours": endHour - startHour } as CSSProperties
          }
        >
          <div className="sui-calendar-header">
            <span className="p-2 text-sui-caption-sm text-sui-text-secondary">
              Time
            </span>
            {days.map((day) => (
              <div
                key={day}
                data-today={day === today}
                className="flex min-h-[72px] items-start justify-center p-4 text-sui-body-md"
              >
                {formatDate(day, locale, { weekday: "short", day: "2-digit" })}
              </div>
            ))}
          </div>
          <div className="sui-calendar-columns">
            <div>
              {Array.from({ length: endHour - startHour }, (_, i) => (
                <div
                  key={i}
                  className="sui-calendar-hour text-sui-caption-sm text-sui-text-secondary"
                >
                  {timeValue((startHour + i) * 60)}
                </div>
              ))}
            </div>
            {days.map((day) => {
              // Each day's simultaneous events get independent lanes. Their text remains readable in the agenda.
              const dayEvents = visible
                .filter(
                  (e) =>
                    e.date === day &&
                    parseTime(e.start)! >= startHour * 60 &&
                    parseTime(e.start)! < endHour * 60,
                )
                .sort((a, b) => a.start.localeCompare(b.start));
              const laneEnds: number[] = [];
              const positioned = dayEvents.map((event) => {
                const start = parseTime(event.start)!;
                let lane = laneEnds.findIndex((end) => end <= start);
                if (lane < 0) lane = laneEnds.length;
                laneEnds[lane] = Math.max(parseTime(event.end)!, start + 92);
                return { event, lane };
              });
              return (
                <div key={day} className="sui-calendar-day-column">
                  {positioned.map(({ event, lane }) => (
                    <div
                      key={event.id}
                      className="sui-calendar-event-position"
                      style={{
                        top:
                          (parseTime(event.start)! - startHour * 60) * 1.5 + 8,
                        left: `calc(${(lane / laneEnds.length) * 100}% + 8px)`,
                        width: `calc(${100 / laneEnds.length}% - 16px)`,
                      }}
                    >
                      {card(event)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="sui-calendar-agenda">
        {days.map((day) => (
          <section
            key={day}
            aria-label={formatDate(day, locale, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            className="flex flex-col gap-2"
          >
            <h3 className="text-sui-label-lg">
              {formatDate(day, locale, {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </h3>
            {visible
              .filter((e) => e.date === day)
              .sort((a, b) => a.start.localeCompare(b.start))
              .map((event) => (
                <div key={event.id}>{card(event)}</div>
              ))}
            {!visible.some((e) => e.date === day) && (
              <p className="text-sui-body-sm text-sui-text-secondary">
                No events
              </p>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
