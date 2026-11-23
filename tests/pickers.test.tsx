import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, afterAll, expect, it, vi } from "vitest";
import { Calendar, DateCalendar, DatePicker, TimePicker } from "../src";
import { clockValue } from "../src/components/internal/ClockDial";
import {
  addDays,
  addMonths,
  parseDate,
  parseTime,
  formatTime,
} from "../src/components/internal/dateTime";

beforeAll(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

it("maps both clock rings, midnight and minute rounding from pointer coordinates", () => {
  expect(clockValue(128, 24, 256, "hour", "24h", 1)).toBe(12);
  expect(clockValue(128, 64, 256, "hour", "24h", 1)).toBe(0);
  expect(clockValue(192, 128, 256, "hour", "24h", 1)).toBe(15);
  expect(clockValue(232, 128, 256, "hour", "24h", 1)).toBe(3);
  expect(clockValue(128, 24, 256, "hour", "12h", 1)).toBe(12);
  expect(clockValue(232, 128, 256, "minute", "24h", 15)).toBe(15);
  expect(clockValue(126, 24, 256, "minute", "24h", 1)).toBe(0);
});

it("locks the format when requested and lets keyboard users select minute precision", async () => {
  const change = vi.fn();
  render(
    <TimePicker
      label="Clock"
      defaultValue="09:30"
      allowFormatSwitch={false}
      onValueChange={change}
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: "Clock" }));
  expect(
    screen.queryByRole("group", { name: "Time format" }),
  ).not.toBeInTheDocument();
  screen.getByRole("slider", { name: "Hour" }).focus();
  await userEvent.keyboard("{ArrowUp}{Enter}{ArrowRight}");
  await userEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(change).toHaveBeenLastCalledWith("10:31");
});
afterAll(() => vi.unstubAllGlobals());

it("validates real ISO dates and preserves dates across leap years and DST", () => {
  expect(parseDate("2026-02-29")).toBeUndefined();
  expect(parseDate("2024-02-29")).toBeInstanceOf(Date);
  expect(parseDate("2026-2-01")).toBeUndefined();
  expect(addDays("2026-03-08", 1)).toBe("2026-03-09");
  expect(addDays("2026-11-01", 1)).toBe("2026-11-02");
  expect(addMonths("2024-01-31", 1)).toBe("2024-02-29");
  expect(addMonths("2024-02-29", 12)).toBe("2025-02-28");
});

it("distinguishes midnight and noon without accepting malformed clock values", () => {
  expect(parseTime("24:00")).toBeUndefined();
  expect(parseTime("9:00")).toBeUndefined();
  expect(parseTime("23:59")).toBe(1439);
  expect(formatTime("00:00", "12h")).toBe("12:00 AM");
  expect(formatTime("12:00", "12h")).toBe("12:00 PM");
  expect(formatTime("23:45", "12h")).toBe("11:45 PM");
});

it("moves date focus across month and year boundaries without selecting", async () => {
  const select = vi.fn();
  render(<DateCalendar value="2024-02-29" onSelect={select} />);
  const leap = screen.getByRole("button", {
    name: "Thursday, 29 February 2024",
  });
  leap.focus();
  await userEvent.keyboard("{PageDown}");
  expect(
    screen.getByRole("button", { name: "Friday, 29 March 2024" }),
  ).toHaveFocus();
  await userEvent.keyboard("{Shift>}{PageUp}{/Shift}");
  expect(
    screen.getByRole("button", { name: "Wednesday, 29 March 2023" }),
  ).toHaveFocus();
  expect(select).not.toHaveBeenCalled();
});

it("keeps unavailable dates discoverable but prevents selection", async () => {
  const select = vi.fn();
  render(
    <DateCalendar value="2026-10-15" min="2026-10-16" onSelect={select} />,
  );
  const day = screen.getByRole("button", { name: "Thursday, 15 October 2026" });
  expect(day).toHaveAttribute("aria-disabled", "true");
  await userEvent.click(day);
  expect(select).not.toHaveBeenCalled();
});

it("does not commit a range spanning an unavailable interior date", async () => {
  const change = vi.fn();
  render(
    <DatePicker
      label="Period"
      mode="range"
      defaultMonth="2026-10-01"
      isDateUnavailable={(day) => day === "2026-10-15"}
      onValueChange={change}
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: "Period" }));
  const dialog = within(screen.getByRole("dialog"));
  await userEvent.click(
    dialog.getByRole("button", { name: "Wednesday, 14 October 2026" }),
  );
  await userEvent.click(
    dialog.getByRole("button", { name: "Friday, 16 October 2026" }),
  );
  expect(dialog.getByRole("button", { name: "Apply" })).toBeDisabled();
  expect(change).not.toHaveBeenCalled();
});

it("preserves parent ownership of a controlled date after requesting a new value", async () => {
  const change = vi.fn();
  render(
    <DatePicker
      label="Review"
      name="review"
      value="2026-10-15"
      onValueChange={change}
    />,
  );
  const trigger = screen.getByRole("button", { name: "Review" });
  await userEvent.click(trigger);
  await userEvent.click(
    screen.getByRole("button", { name: "Friday, 16 October 2026" }),
  );
  await userEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(change).toHaveBeenLastCalledWith("2026-10-16");
  expect(trigger).toHaveTextContent("15 Oct 2026");
});

it("supports external forms and canceled reset without emitting value changes", async () => {
  const change = vi.fn();
  let preventReset = true;
  render(
    <>
      <form
        id="booking"
        data-testid="booking"
        onReset={(event) => {
          if (preventReset) event.preventDefault();
        }}
      />
      <TimePicker
        label="Start"
        name="start"
        form="booking"
        defaultValue="09:30"
        onValueChange={change}
      />
    </>,
  );
  const trigger = screen.getByRole("button", { name: "Start" });
  await userEvent.click(trigger);
  const hour = screen.getByRole("slider", { name: "Hour" });
  hour.focus();
  await userEvent.keyboard("{ArrowUp}{Enter}");
  expect(screen.getByRole("slider", { name: "Minute" })).toHaveFocus();
  await userEvent.click(screen.getByRole("button", { name: "Apply" }));
  const form = screen.getByTestId("booking") as HTMLFormElement;
  expect(new FormData(form).get("start")).toBe("10:30");
  fireEvent.reset(form);
  await waitFor(() => expect(trigger).toHaveTextContent("10:30"));
  preventReset = false;
  fireEvent.reset(form);
  await waitFor(() => expect(trigger).toHaveTextContent("09:30"));
  expect(change).toHaveBeenCalledTimes(1);
});

it("keeps readonly dates submitted and excludes disabled dates", () => {
  render(
    <form data-testid="form">
      <DatePicker
        label="Read only"
        name="readonly"
        defaultValue="2026-10-15"
        readOnly
      />
      <DatePicker
        label="Disabled"
        name="disabled"
        defaultValue="2026-10-16"
        disabled
      />
    </form>,
  );
  const data = new FormData(screen.getByTestId("form") as HTMLFormElement);
  expect(data.get("readonly")).toBe("2026-10-15");
  expect(data.has("disabled")).toBe(false);
});

it("uses the complete agenda for events outside the displayed hour bounds", () => {
  render(
    <Calendar
      startDate="2026-10-12"
      events={[
        {
          id: "early",
          date: "2026-10-12",
          start: "07:00",
          end: "08:00",
          title: "Early review",
        },
      ]}
      label="Schedule"
    />,
  );
  expect(screen.getByRole("region", { name: "Schedule" })).toHaveAttribute(
    "data-agenda",
    "true",
  );
  expect(screen.getByText("Early review")).toBeInTheDocument();
});

it("rejects invalid calendar bounds instead of silently producing a broken grid", () => {
  expect(() => render(<Calendar startDate="2026-02-30" events={[]} />)).toThrow(
    RangeError,
  );
  expect(() =>
    render(<TimePicker label="Invalid" min="18:00" max="08:00" />),
  ).toThrow(RangeError);
});
