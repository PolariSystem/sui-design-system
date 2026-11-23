import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../src/components/Button";
import { Input } from "../src/components/Input";
import { Checkbox } from "../src/components/Checkbox";

describe("Button behavior", () => {
  it("activates by keyboard without submitting a parent form by default", async () => {
    const user = userEvent.setup();
    const click = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <Button onClick={click}>Save</Button>
      </form>,
    );
    await user.tab();
    await user.keyboard("{Enter}");
    expect(click).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
  });
  it("prevents duplicate actions while busy and exposes a busy label", async () => {
    const click = vi.fn();
    const user = userEvent.setup();
    render(
      <Button loading loadingLabel="Saving" onClick={click}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Saving" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    await user.click(button);
    expect(click).not.toHaveBeenCalled();
  });
});
describe("Input accessibility", () => {
  it("associates label and error while preserving external descriptions", () => {
    render(
      <>
        <p id="extra">Workspace details</p>
        <Input label="Email" error="Invalid email" aria-describedby="extra" />
      </>,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      "Workspace details Invalid email",
    );
  });
  it("keeps readonly focusable, skips disabled, and accepts input", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Input label="Locked" readOnly value="Serenity" />
        <Input label="Unavailable" disabled />
        <Input label="Editable" />
      </>,
    );
    await user.tab();
    expect(screen.getByLabelText("Locked")).toHaveFocus();
    await user.keyboard("x");
    expect(screen.getByLabelText("Locked")).toHaveValue("Serenity");
    await user.tab();
    expect(screen.getByLabelText("Editable")).toHaveFocus();
    await user.keyboard("New name");
    expect(screen.getByLabelText("Editable")).toHaveValue("New name");
  });
});
describe("Checkbox native semantics", () => {
  it("exposes mixed state and toggles with Space", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<Checkbox label="Select records" indeterminate onChange={change} />);
    const input = screen.getByRole("checkbox", { name: "Select records" });
    expect(input).toBePartiallyChecked();
    await user.tab();
    await user.keyboard(" ");
    expect(input).toBeChecked();
    expect(input).not.toBePartiallyChecked();
    expect(change).toHaveBeenCalledOnce();
  });
  it("submits a checked value using native FormData and ignores a disabled control", () => {
    const { container } = render(
      <form>
        <Checkbox label="Report" name="records" value="report" defaultChecked />
        <Checkbox
          label="Hidden"
          name="records"
          value="hidden"
          defaultChecked
          disabled
        />
      </form>,
    );
    expect(
      new FormData(container.querySelector("form")!).getAll("records"),
    ).toEqual(["report"]);
  });
});
