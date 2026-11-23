import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Checkbox, DatePicker, TimePicker, Select } from "../src";

beforeAll(() =>
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  })),
);
afterAll(() => vi.unstubAllGlobals());

describe("consumer form integration", () => {
  it("exposes the checkbox input for focus and retains native mixed-state submission", () => {
    const ref = createRef<HTMLInputElement>();
    const { unmount } = render(
      <form aria-label="Preferences">
        <Checkbox
          ref={ref}
          label="Updates"
          name="updates"
          value="yes"
          defaultChecked
          indeterminate
        />
      </form>,
    );
    expect(ref.current).toBe(screen.getByRole("checkbox"));
    expect(ref.current?.indeterminate).toBe(true);
    ref.current?.focus();
    expect(ref.current).toHaveFocus();
    expect(
      new FormData(screen.getByRole("form") as HTMLFormElement).get("updates"),
    ).toBe("yes");
    unmount();
    expect(ref.current).toBeNull();
  });

  it("cleans up replaced and unmounted callback refs without detaching stable refs on rerender", () => {
    const cleanup = vi.fn();
    const first = vi.fn(() => cleanup);
    const second = vi.fn();
    const view = render(<Checkbox label="Updates" ref={first} />);
    view.rerender(<Checkbox label="Updated label" ref={first} />);
    expect(first).toHaveBeenCalledTimes(1);
    view.rerender(<Checkbox label="Updates" ref={second} />);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith(screen.getByRole("checkbox"));
    view.unmount();
    expect(second).toHaveBeenLastCalledWith(null);
  });

  it.each(["date", "time", "single", "multiple"])(
    "exposes the %s visible trigger for focus and blur",
    (kind) => {
      const ref = createRef<HTMLButtonElement>();
      const onBlur = vi.fn();
      const triggerProps = { ref, onBlur };
      const { unmount } = render(
        kind === "date" ? (
          <DatePicker label="Value" triggerProps={triggerProps} />
        ) : kind === "time" ? (
          <TimePicker label="Value" triggerProps={triggerProps} />
        ) : (
          <Select
            label="Value"
            multiple={kind === "multiple"}
            triggerProps={triggerProps}
          >
            <option value="a">A</option>
          </Select>
        ),
      );
      expect(ref.current).toHaveAccessibleName("Value");
      ref.current?.focus();
      expect(ref.current).toHaveFocus();
      fireEvent.blur(ref.current!);
      expect(onBlur).toHaveBeenCalledTimes(1);
      unmount();
      expect(ref.current).toBeNull();
    },
  );
});
