import { createRef, useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  OTPInput,
  PasswordInput,
  Radio,
  Select,
  Switch,
  Textarea,
} from "../src";

describe("Native form controls", () => {
  it("associates multiline errors and preserves entered text, native props and ref", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLTextAreaElement>();
    const { container } = render(
      <form>
        <p id="context">Shared workspace</p>
        <Textarea
          ref={ref}
          label="Notes"
          name="notes"
          defaultValue="First line"
          error="Add more detail"
          aria-describedby="context"
          required
        />
      </form>,
    );
    const input = screen.getByRole("textbox", { name: "Notes" });
    expect(ref.current).toBe(input);
    expect(input).toHaveAccessibleDescription(
      "Shared workspace Add more detail",
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
    await user.type(input, "{Enter}Second line");
    expect(new FormData(container.querySelector("form")!).get("notes")).toBe(
      "First line\nSecond line",
    );
  });

  it("keeps readonly fields focusable and excludes disabled fields from form data", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <Textarea
          label="Locked"
          readOnly
          name="locked"
          defaultValue="Approved"
        />
        <Textarea
          label="Disabled notes"
          disabled
          name="disabled"
          defaultValue="Hidden"
        />
        <Select label="Next field">
          <option>Next</option>
        </Select>
      </form>,
    );
    await user.tab();
    expect(screen.getByLabelText("Locked")).toHaveFocus();
    await user.keyboard("Changed");
    expect(screen.getByLabelText("Locked")).toHaveValue("Approved");
    await user.tab();
    expect(screen.getByLabelText("Next field")).toHaveFocus();
    expect(new FormData(container.querySelector("form")!).has("disabled")).toBe(
      false,
    );
  });

  it("submits single selection and respects disabled options, errors and form reset", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <Select
          label="Category"
          name="category"
          defaultValue="operations"
          error="Check category"
        >
          <option value="operations">Operations</option>
          <option value="research">Research</option>
          <option value="blocked" disabled>
            Unavailable
          </option>
        </Select>
        <button type="reset">Reset</button>
      </form>,
    );
    const select = screen.getByRole("combobox", { name: "Category" });
    expect(select).toHaveAccessibleDescription("Check category");
    await user.click(select);
    await user.click(screen.getByRole("option", { name: "Research" }));
    await user.click(select);
    expect(screen.getByRole("option", { name: "Unavailable" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await user.keyboard("{Escape}");
    expect(new FormData(container.querySelector("form")!).get("category")).toBe(
      "research",
    );
    await user.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(select).toHaveTextContent("Operations"));
    expect(new FormData(container.querySelector("form")!).get("category")).toBe(
      "operations",
    );
  });

  it("keeps radio groups exclusive, submits only the selection and restores defaults", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <fieldset>
          <legend>Frequency</legend>
          <Radio label="Daily" name="frequency" value="daily" defaultChecked />
          <Radio label="Weekly" name="frequency" value="weekly" />
          <Radio label="Monthly" name="frequency" value="monthly" disabled />
        </fieldset>
        <button type="reset">Reset</button>
      </form>,
    );
    await user.click(screen.getByRole("radio", { name: "Weekly" }));
    expect(screen.getByRole("radio", { name: "Daily" })).not.toBeChecked();
    await user.click(screen.getByRole("radio", { name: "Monthly" }));
    expect(
      new FormData(container.querySelector("form")!).getAll("frequency"),
    ).toEqual(["weekly"]);
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("radio", { name: "Daily" })).toBeChecked();
  });

  it("toggles a switch by Space, exposes its state and submits a checked value", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <Switch label="Notifications" name="notify" value="email" />
        <Switch
          label="Unavailable setting"
          name="unavailable"
          defaultChecked
          disabled
        />
      </form>,
    );
    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByRole("switch", { name: "Notifications" })).toBeChecked();
    const data = new FormData(container.querySelector("form")!);
    expect(data.get("notify")).toBe("email");
    expect(data.has("unavailable")).toBe(false);
  });
});

describe("OTPInput", () => {
  it("accepts formatted paste as one code, preserves leading zeros and never auto-submits", async () => {
    const user = userEvent.setup();
    const submit = vi.fn((event) => event.preventDefault());
    const change = vi.fn();
    const { container } = render(
      <form onSubmit={submit}>
        <OTPInput label="Code" name="code" onValueChange={change} required />
        <button>Verify</button>
      </form>,
    );
    await user.tab();
    await user.paste("01 23-45");
    const input = screen.getByRole("textbox", { name: "Code" });
    expect(input).toHaveValue("012345");
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(new FormData(container.querySelector("form")!).get("code")).toBe(
      "012345",
    );
    expect(change).toHaveBeenLastCalledWith("012345");
    expect(submit).not.toHaveBeenCalled();
    await user.tab();
    expect(screen.getByRole("button", { name: "Verify" })).toHaveFocus();
  });

  it("supports controlled replacement, deletion and full-value autofill events", async () => {
    function ControlledCode() {
      const [value, setValue] = useState("012345");
      return <OTPInput label="Code" value={value} onValueChange={setValue} />;
    }
    const user = userEvent.setup();
    render(<ControlledCode />);
    const input = screen.getByLabelText("Code") as HTMLInputElement;
    input.focus();
    input.setSelectionRange(1, 3);
    await user.keyboard("9");
    expect(input).toHaveValue("09345");
    await user.keyboard("{Backspace}");
    expect(input).toHaveValue("0345");
    fireEvent.change(input, { target: { value: "008822" } });
    expect(input).toHaveValue("008822");
  });

  it("restores its default on reset but honors cancellation", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <form>
        <OTPInput label="Code" defaultValue="001122" />
        <button type="reset">Reset</button>
      </form>,
    );
    const input = screen.getByLabelText("Code");
    fireEvent.change(input, { target: { value: "112233" } });
    await user.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(input).toHaveValue("001122"));
    rerender(
      <form onReset={(event) => event.preventDefault()}>
        <OTPInput label="Code" defaultValue="001122" />
        <button type="reset">Reset</button>
      </form>,
    );
    fireEvent.change(input, { target: { value: "445566" } });
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(input).toHaveValue("445566");
  });

  it("exposes its native ref, labels and errors, and keeps disabled values out of submission", () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <form>
        <OTPInput
          ref={ref}
          label="Code"
          error="Expired code"
          name="code"
          defaultValue="123456"
          disabled
        />
      </form>,
    );
    expect(ref.current).toBe(screen.getByLabelText("Code"));
    expect(ref.current).toHaveAccessibleDescription("Expired code");
    expect(ref.current).toHaveAttribute("aria-invalid", "true");
    expect(new FormData(container.querySelector("form")!).has("code")).toBe(
      false,
    );
  });
});

describe("PasswordInput", () => {
  it("toggles by keyboard without changing value, focus or form submission", async () => {
    const user = userEvent.setup();
    const submit = vi.fn((event) => event.preventDefault());
    const ref = createRef<HTMLInputElement>();
    render(
      <form onSubmit={submit}>
        <PasswordInput
          ref={ref}
          label="Password"
          defaultValue="Quiet-river-2026"
        />
      </form>,
    );
    await user.tab();
    expect(ref.current).toHaveFocus();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(ref.current).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveFocus();
    expect(ref.current).toHaveValue("Quiet-river-2026");
    await user.keyboard(" ");
    expect(ref.current).toHaveAttribute("type", "password");
    expect(submit).not.toHaveBeenCalled();
  });

  it("remasks on native reset, supports localized labels and disables its action", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <form>
        <PasswordInput
          label="Password"
          defaultValue="Original"
          showPasswordLabel="Reveal value"
          hidePasswordLabel="Mask value"
        />
        <button type="reset">Reset</button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Reveal value" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() =>
      expect(screen.getByLabelText("Password")).toHaveAttribute(
        "type",
        "password",
      ),
    );
    rerender(<PasswordInput label="Password" disabled />);
    expect(
      screen.getByRole("button", { name: "Show password" }),
    ).toBeDisabled();
  });
});
