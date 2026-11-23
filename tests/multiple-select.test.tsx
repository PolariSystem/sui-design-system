import { createRef, useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "../src";

const options = (
  <>
    <optgroup label="Available teams">
      <option value="operations">Operations</option>
      <option value="product">Product</option>
      <option value="support">Support</option>
    </optgroup>
    <option value="archived" disabled>
      Archived
    </option>
  </>
);

describe("multiple Select", () => {
  it("starts empty, toggles several options without closing and submits native values once per change", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const capture = vi.fn();
    const nativeChange = vi.fn();
    const { container } = render(
      <form onChangeCapture={capture}>
        <Select
          multiple
          label="Teams"
          name="teams"
          placeholder="Select teams"
          onValueChange={change}
          onChange={(event) =>
            nativeChange(
              Array.from(
                event.currentTarget.selectedOptions,
                (option) => option.value,
              ),
            )
          }
        >
          {options}
        </Select>
        <button type="button">Outside</button>
      </form>,
    );
    const data = () =>
      new FormData(container.querySelector("form")!).getAll("teams");
    expect(data()).toEqual([]);
    const trigger = screen.getByRole("combobox", { name: "Teams" });
    await user.click(trigger);
    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-multiselectable",
      "true",
    );
    expect(screen.queryByText("Available teams")).not.toBeInTheDocument();
    for (const option of screen.getAllByRole("option"))
      expect(option).toHaveAttribute("aria-selected", "false");
    await user.click(screen.getByRole("option", { name: "Support" }));
    await user.click(screen.getByRole("option", { name: "Operations" }));
    expect(screen.getByRole("listbox")).toBeVisible();
    expect(trigger).toHaveTextContent("Operations, Support");
    expect(data()).toEqual(["operations", "support"]);
    await user.click(screen.getByRole("option", { name: "Archived" }));
    expect(change).toHaveBeenCalledTimes(2);
    await user.click(screen.getByRole("option", { name: "Support" }));
    expect(data()).toEqual(["operations"]);
    expect(change).toHaveBeenLastCalledWith(["operations"]);
    expect(nativeChange).toHaveBeenLastCalledWith(["operations"]);
    expect(capture).toHaveBeenCalledTimes(3);
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("restores uncontrolled defaults on reset and respects cancellation without emitting changes", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const ref = createRef<HTMLSelectElement>();
    let cancel = true;
    const { container } = render(
      <form
        onReset={(event) => {
          if (cancel) event.preventDefault();
        }}
      >
        <Select
          multiple
          label="Teams"
          name="teams"
          ref={ref}
          defaultValue={["product"]}
          onValueChange={change}
        >
          {options}
        </Select>
        <button type="reset">Reset</button>
      </form>,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Operations" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(
      new FormData(container.querySelector("form")!).getAll("teams"),
    ).toEqual(["operations", "product"]);
    cancel = false;
    await user.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() =>
      expect(screen.getByRole("combobox")).toHaveTextContent("Product"),
    );
    expect(
      Array.from(ref.current!.selectedOptions, (option) => option.value),
    ).toEqual(["product"]);
    expect(change).toHaveBeenCalledExactlyOnceWith(["operations", "product"]);
  });

  it("accepts parent-controlled reset and native change events", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLSelectElement>();
    function Controlled() {
      const [value, setValue] = useState(["support"]);
      return (
        <form onReset={() => setValue(["support"])}>
          <Select
            multiple
            label="Teams"
            name="teams"
            ref={ref}
            value={value}
            onValueChange={setValue}
          >
            {options}
          </Select>
          <button type="reset">Reset</button>
        </form>
      );
    }
    const { container } = render(<Controlled />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Product" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() =>
      expect(
        new FormData(container.querySelector("form")!).getAll("teams"),
      ).toEqual(["support"]),
    );
    for (const option of ref.current!.options)
      option.selected = option.value === "operations";
    fireEvent.change(ref.current!);
    expect(screen.getByRole("combobox")).toHaveTextContent("Operations");
  });

  it("does not change a controlled value when the parent declines the change", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(
      <form>
        <Select
          multiple
          label="Teams"
          name="teams"
          value={["support"]}
          onValueChange={change}
        >
          {options}
        </Select>
      </form>,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Product" }));
    expect(change).toHaveBeenCalledExactlyOnceWith(["product", "support"]);
    expect(screen.getByRole("combobox")).toHaveTextContent("Support");
    expect(
      new FormData(container.querySelector("form")!).getAll("teams"),
    ).toEqual(["support"]);
    expect(screen.getByRole("option", { name: "Product" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("preserves required validation, external form association, focus refs and disabled omission", async () => {
    const ref = createRef<HTMLSelectElement>();
    const trigger = createRef<HTMLButtonElement>();
    const { container, rerender } = render(
      <>
        <form id="workspace" />
        <Select
          multiple
          label="Teams"
          name="teams"
          form="workspace"
          ref={ref}
          triggerProps={{ ref: trigger }}
          required
        >
          {options}
        </Select>
      </>,
    );
    expect(ref.current!.checkValidity()).toBe(false);
    await waitFor(() => expect(trigger.current).toHaveFocus());
    const user = userEvent.setup();
    await user.click(trigger.current!);
    await user.click(screen.getByRole("option", { name: "Product" }));
    expect(ref.current!.checkValidity()).toBe(true);
    expect(
      new FormData(container.querySelector("form")!).getAll("teams"),
    ).toEqual(["product"]);
    rerender(
      <>
        <form id="workspace" />
        <Select multiple label="Teams" name="teams" form="workspace" disabled>
          {options}
        </Select>
      </>,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(
      new FormData(container.querySelector("form")!).getAll("teams"),
    ).toEqual([]);
    rerender(
      <>
        <form id="workspace" />
        <Select multiple label="Teams" name="teams" form="workspace">
          {options}
        </Select>
      </>,
    );
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
