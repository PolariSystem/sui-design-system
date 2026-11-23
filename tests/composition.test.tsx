import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../src";

describe("Composed interactive elements", () => {
  it("preserves a menu link, icons, handlers and ref on the same element", async () => {
    const ref = createRef<HTMLAnchorElement>();
    const select = vi.fn();
    const click = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            asChild
            className="custom-item"
            leftIcon={<span>Leading icon</span>}
            rightIcon={<span>Trailing icon</span>}
            onSelect={select}
          >
            <a href="#records" ref={ref} className="custom-link" onClick={click}>
              Records
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const item = screen.getByRole("menuitem", { name: "Records" });
    expect(item.tagName).toBe("A");
    expect(item).toHaveAttribute("href", "#records");
    expect(item).toHaveClass("sui-menu-item", "custom-item", "custom-link");
    expect(ref.current).toBe(item);
    expect(item).toContainElement(screen.getByText("Leading icon"));
    expect(item).toContainElement(screen.getByText("Trailing icon"));
    await userEvent.click(item);
    expect(click).toHaveBeenCalledOnce();
    expect(select).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("allows a composed menu action to prevent selection and remain open", async () => {
    const select = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild onSelect={select}>
            <button onClick={(event) => event.preventDefault()}>Keep open</button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await userEvent.click(screen.getByRole("menuitem", { name: "Keep open" }));
    expect(select).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("retains keyboard activation and disabled behavior on composed tab buttons", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLButtonElement>();
    render(
      <Tabs defaultValue="one" activationMode="manual">
        <TabsList aria-label="Views">
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="disabled" asChild disabled>
            <button>Unavailable</button>
          </TabsTrigger>
          <TabsTrigger
            value="two"
            asChild
            leftIcon={<span>Leading icon</span>}
            rightIcon={<span>Trailing icon</span>}
          >
            <button ref={ref} className="custom-tab">
              Two
            </button>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="one">First panel</TabsContent>
        <TabsContent value="two">Second panel</TabsContent>
      </Tabs>,
    );
    const tab = screen.getByRole("tab", { name: "Two" });
    expect(tab.tagName).toBe("BUTTON");
    expect(tab).toHaveClass("sui-tab", "custom-tab");
    expect(ref.current).toBe(tab);
    expect(tab).toContainElement(screen.getByText("Leading icon"));
    expect(tab).toContainElement(screen.getByText("Trailing icon"));
    expect(screen.getByRole("tab", { name: "Unavailable" })).toBeDisabled();
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(tab).toHaveFocus();
    expect(tab).toHaveAttribute("aria-selected", "false");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("tabpanel", { name: "Two" })).toHaveTextContent(
      "Second panel",
    );
  });
});
