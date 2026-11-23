import { createRef, useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "../src";

describe("Select form bridge", () => {
  it("keeps the native value aligned when a parent resets controlled state", async () => {
    function ControlledReset() {
      const [value, setValue] = useState("one");
      return (
        <form onReset={() => setValue("one")}>
          <Select
            label="Team"
            name="team"
            value={value}
            onValueChange={setValue}
          >
            <option value="one">One</option>
            <option value="two">Two</option>
          </Select>
          <button type="reset">Reset</button>
        </form>
      );
    }
    const user = userEvent.setup();
    const { container } = render(<ControlledReset />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Two" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() =>
      expect(screen.getByRole("combobox")).toHaveTextContent("One"),
    );
    expect(new FormData(container.querySelector("form")!).get("team")).toBe(
      "one",
    );
  });

  it("emits one original-value change and submits a controlled value", async () => {
    const change = vi.fn();
    const formChange = vi.fn();
    const captureChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState("");
      return (
        <form onChange={formChange} onChangeCapture={captureChange}>
          <Select
            label="Team"
            name="team"
            value={value}
            onChange={(event) => {
              change(event.target.value);
              setValue(event.target.value);
            }}
          >
            <option value="">Choose a team</option>
            <option value="option:engineering">Engineering</option>
          </Select>
        </form>
      );
    }
    const user = userEvent.setup();
    const { container } = render(<Controlled />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Engineering" }));
    expect(screen.getByRole("combobox")).toHaveTextContent("Engineering");
    expect(change).toHaveBeenCalledExactlyOnceWith("option:engineering");
    expect(formChange).toHaveBeenCalledTimes(1);
    expect(captureChange).toHaveBeenCalledTimes(1);
    expect(
      new FormData(container.querySelector("form")!).getAll("team"),
    ).toEqual(["option:engineering"]);
  });

  it("honors cancelled reset without emitting changes or losing the selection", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(
      <form onReset={(event) => event.preventDefault()}>
        <Select
          label="Team"
          name="team"
          defaultValue="one"
          onValueChange={change}
        >
          <option value="one">One</option>
          <option value="two">Two</option>
        </Select>
        <button type="reset">Reset</button>
      </form>,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Two" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("combobox")).toHaveTextContent("Two");
    expect(new FormData(container.querySelector("form")!).get("team")).toBe(
      "two",
    );
    expect(change).toHaveBeenCalledExactlyOnceWith("two");
  });

  it("supports groups, fragments, disabled groups and options without explicit values", async () => {
    const user = userEvent.setup();
    render(
      <Select label="Team">
        <>
          <optgroup label="Available">
            <option>Engineering</option>
          </optgroup>
          <optgroup label="Unavailable" disabled>
            <option>Operations</option>
          </optgroup>
        </>
      </Select>,
    );
    await user.click(screen.getByRole("combobox"));
    expect(
      screen.getByRole("group", { name: "Available" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Available")).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Operations" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await user.keyboard("{Escape}");
    expect(screen.getByRole("combobox")).toHaveTextContent("Engineering");
  });

  it("keeps required validation and refs connected to the visible trigger in external forms", async () => {
    const ref = createRef<HTMLSelectElement>();
    const triggerRef = createRef<HTMLButtonElement>();
    const { container, rerender } = render(
      <>
        <form id="profile" />
        <Select
          label="Team"
          ref={ref}
          triggerProps={{ ref: triggerRef }}
          form="profile"
          name="team"
          required
          defaultValue=""
        >
          <option value="">Choose a team</option>
          <option>Engineering</option>
        </Select>
      </>,
    );
    expect(ref.current?.checkValidity()).toBe(false);
    await waitFor(() => expect(triggerRef.current).toHaveFocus());
    fireEvent.change(ref.current!, { target: { value: "Engineering" } });
    expect(new FormData(container.querySelector("form")!).get("team")).toBe(
      "Engineering",
    );
    rerender(
      <>
        <form id="profile" />
        <Select label="Team" form="profile" name="team" disabled>
          <option>Engineering</option>
        </Select>
      </>,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(new FormData(container.querySelector("form")!).has("team")).toBe(
      false,
    );
  });
});
