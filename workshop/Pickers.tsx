import { useRef, useState } from "react";
import {
  Button,
  Calendar,
  CardFooter,
  DateCalendar,
  DatePicker,
  Dialog,
  DialogContent,
  TimePicker,
  type CalendarEvent,
  type DateRange,
} from "../src";
import { Example, Section, Specimen } from "./components";

function SchedulingExample() {
  const [date, setDate] = useState("2026-10-15");
  const [range, setRange] = useState<DateRange>({
    start: "2026-10-12",
    end: "2026-10-16",
  });
  const [message, setMessage] = useState("Nothing submitted.");
  return (
    <form
      onReset={() => {
        setDate("2026-10-15");
        setRange({ start: "2026-10-12", end: "2026-10-16" });
      }}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setMessage(
          `Preview values: ${data.get("date")}; ${data.get("period.start")} to ${data.get("period.end")}.`,
        );
      }}
      className="flex max-w-xl flex-col gap-4"
    >
      <DatePicker
        label="Review date"
        name="date"
        value={date}
        onValueChange={setDate}
        required
        min="2026-10-12"
        max="2027-12-31"
        helperText="Choose a date from 12 October 2026 onward."
      />
      <DatePicker
        label="Reporting period"
        name="period"
        mode="range"
        value={range}
        onValueChange={setRange}
        required
        min="2026-10-12"
        helperText="Select the start and end, then apply."
      />
      <DatePicker
        label="Restricted date"
        name="restricted"
        defaultMonth="2026-10-01"
        isDateUnavailable={(date) => date === "2026-10-17"}
        helperText="17 October is unavailable."
      />
      <CardFooter>
        <Button type="submit">Save dates</Button>
        <Button type="reset" variant="secondary">
          Reset dates
        </Button>
      </CardFooter>
      <p role="status" className="text-sui-body-sm">
        {message}
      </p>
    </form>
  );
}
function TimeExample() {
  const [message, setMessage] = useState("No time submitted.");
  return (
    <form
      className="flex max-w-xl flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setMessage(
          `Preview times: ${data.get("start")}, ${data.get("reminder")}.`,
        );
      }}
    >
      <TimePicker
        label="Meeting start"
        name="start"
        defaultValue="09:30"
        required
        format="12h"
        helperText="Workspace time zone: America/Havana."
      />
      <TimePicker
        label="Reminder time"
        name="reminder"
        defaultValue="14:00"
        min="08:00"
        max="18:00"
        minuteStep={15}
        helperText="Available from 08:00 to 18:00, every 15 minutes."
      />
      <CardFooter>
        <Button type="submit">Save times</Button>
        <Button type="reset" variant="secondary">
          Reset times
        </Button>
      </CardFooter>
      <p role="status" className="text-sui-body-sm">
        {message}
      </p>
    </form>
  );
}
const events: CalendarEvent[] = [
  {
    id: "planning",
    date: "2026-10-05",
    start: "09:00",
    end: "10:30",
    title: "Weekly planning",
    initials: "AM",
  },
  {
    id: "prepare",
    date: "2026-10-05",
    start: "12:00",
    end: "13:30",
    title: "Prepare review notes",
    type: "note",
    initials: "JC",
  },
  {
    id: "review",
    date: "2026-10-06",
    start: "10:00",
    end: "11:30",
    title: "Product review",
    initials: "TR",
  },
  {
    id: "interviews",
    date: "2026-10-06",
    start: "13:00",
    end: "14:30",
    title: "Customer interviews",
    tone: "success",
    initials: "JL",
  },
  {
    id: "workshop",
    date: "2026-10-07",
    start: "09:30",
    end: "11:00",
    title: "Workspace workshop",
    initials: "SR",
  },
  {
    id: "research",
    date: "2026-10-07",
    start: "12:00",
    end: "13:30",
    title: "Research synthesis",
    type: "note",
    initials: "JC",
  },
  {
    id: "critique",
    date: "2026-10-08",
    start: "11:00",
    end: "12:30",
    title: "Design critique",
    initials: "AM",
  },
  {
    id: "handoff",
    date: "2026-10-08",
    start: "13:00",
    end: "14:30",
    title: "Update handoff notes",
    type: "note",
    initials: "TR",
  },
  {
    id: "checkin",
    date: "2026-10-09",
    start: "09:30",
    end: "11:00",
    title: "Team check-in",
    tone: "success",
    initials: "AM",
  },
  {
    id: "priorities",
    date: "2026-10-09",
    start: "12:30",
    end: "14:00",
    title: "Next week priorities",
    type: "note",
    initials: "JC",
  },
];
function CalendarExample() {
  const eventTrigger = useRef<HTMLElement | null>(null);
  const [selected, setSelected] = useState<CalendarEvent>();
  const [nextWeek, setNextWeek] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <CardFooter>
        <Button variant="secondary" onClick={() => setNextWeek(!nextWeek)}>
          {nextWeek ? "Previous week" : "Next week"}
        </Button>
      </CardFooter>
      <Calendar
        startDate={nextWeek ? "2026-10-12" : "2026-10-05"}
        events={events}
        today="2026-10-09"
        onEventClick={(event) => {
          eventTrigger.current = document.activeElement as HTMLElement;
          setSelected(event);
        }}
        label="Planner example"
      />
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(undefined);
        }}
      >
        <DialogContent
          title={selected?.title ?? "Event details"}
          description={
            selected
              ? `${selected.date} · ${selected.start} – ${selected.end}`
              : undefined
          }
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            eventTrigger.current?.focus();
          }}
        >
          <p className="text-sui-body-sm">
            This event is shown from local preview data.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function Pickers() {
  return (
    <>
      <Section
        name="DatePicker"
        description="Single dates and ranges, with staged selection, unavailable dates and native form values."
      >
        <Specimen>
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            <div className="flex max-w-[352px] flex-col gap-4">
              <h3 className="text-sui-heading-xs">Single date</h3>
              <p className="text-sui-body-sm text-sui-text-secondary">
                One deadline, appointment or review date.
              </p>
              <DatePicker
                label="Date specimen"
                defaultValue="2026-10-15"
                helperText="Choose a date."
              />
              <DatePicker label="Empty date" defaultMonth="2026-10-01" />
              <DatePicker
                label="Unavailable date"
                defaultValue="2026-10-15"
                disabled
              />
              <DatePicker
                label="Read-only date"
                defaultValue="2026-10-15"
                readOnly
              />
              <DatePicker
                label="Date with error"
                error="Choose an available date."
              />
            </div>
            <div className="flex max-w-[352px] flex-col gap-4">
              <h3 className="text-sui-heading-xs">Date range</h3>
              <p className="text-sui-body-sm text-sui-text-secondary">
                An inclusive period for reports, bookings or filters.
              </p>
              <DatePicker
                label="Range specimen"
                mode="range"
                defaultValue={{ start: "2026-10-12", end: "2026-10-16" }}
                helperText="Choose a start and end date, then apply."
              />
              <DatePicker
                label="Empty range"
                mode="range"
                defaultMonth="2026-10-01"
              />
              <DatePicker
                label="Read-only range"
                mode="range"
                defaultValue={{ start: "2026-10-12", end: "2026-10-16" }}
                readOnly
              />
              <DatePicker
                label="Range with error"
                mode="range"
                error="Choose a complete date range."
              />
            </div>
            <div className="sui-picker-panel rounded-sui-card border border-sui-border-default shadow-sui-elevation-floating">
              <DateCalendar
                value="2026-10-15"
                today="2026-10-12"
                min="2026-10-12"
              />
              <p className="sui-picker-summary">15 Oct 2026</p>
            </div>
            <div className="sui-picker-panel rounded-sui-card border border-sui-border-default shadow-sui-elevation-floating">
              <DateCalendar
                mode="range"
                range={{ start: "2026-10-12", end: "2026-10-16" }}
                today="2026-10-12"
              />
              <p className="sui-picker-summary">12 Oct 2026 – 16 Oct 2026</p>
            </div>
          </div>
        </Specimen>
        <Example>
          <SchedulingExample />
        </Example>
      </Section>
      <Section
        name="TimePicker"
        description="Choose hours, then minutes on a circular clock. Switch between 12 and 24 hours; values remain HH:mm."
      >
        <Specimen>
          <div className="grid gap-4 md:grid-cols-2">
            <TimePicker
              label="24-hour specimen"
              defaultValue="09:30"
              helperText="24-hour format"
            />
            <TimePicker
              label="12-hour specimen"
              defaultValue="09:30"
              format="12h"
              helperText="12-hour format"
            />
            <TimePicker label="Disabled time" defaultValue="09:30" disabled />
            <TimePicker label="Read-only time" defaultValue="09:30" readOnly />
            <TimePicker label="Empty time" />
            <TimePicker
              label="Time with error"
              error="Choose an available time."
            />
          </div>
        </Specimen>
        <Example>
          <TimeExample />
        </Example>
      </Section>
      <Section
        name="Calendar"
        description="A five-day planner with data-positioned event cards and a chronological mobile agenda."
      >
        <Specimen>
          <Calendar
            startDate="2026-10-05"
            today="2026-10-09"
            events={events}
            label="Calendar specimen"
          />
        </Specimen>
        <Example>
          <CalendarExample />
        </Example>
      </Section>
    </>
  );
}
