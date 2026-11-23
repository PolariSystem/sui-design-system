import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Alert,
  Avatar,
  Breadcrumb,
  EmptyState,
  Link,
  NavigationItem,
  Pagination,
  Progress,
  Skeleton,
  Stepper,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Tag,
  Toast,
  ToastProvider,
  ToastViewport,
} from "../src";

describe("Navigation contracts", () => {
  it("removes disabled link destinations and blocks pointer activation", async () => {
    const click = vi.fn();
    render(
      <Link href="/records" disabled onClick={click}>
        Records
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Records" });
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(link);
    expect(click).not.toHaveBeenCalled();
  });
  it("keeps compact navigation named and changes artwork with selection", () => {
    const props = {
      label: "Records",
      href: "/records",
      icon: <span>Duotone</span>,
      activeIcon: <span>Bold</span>,
      layout: "compact" as const,
    };
    const { rerender } = render(<NavigationItem {...props} />);
    expect(screen.getByRole("link", { name: "Records" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByText("Duotone")).toBeInTheDocument();
    rerender(<NavigationItem {...props} active />);
    expect(screen.getByRole("link", { name: "Records" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.queryByText("Duotone")).not.toBeInTheDocument();
    expect(screen.getByText("Bold")).toBeInTheDocument();
  });
  it("retains the current breadcrumb and its nearest ancestor in compact mode", () => {
    render(
      <Breadcrumb
        compact
        items={[
          { label: "Workspace", href: "/" },
          { label: "Records", href: "/records" },
          { label: "New record" },
        ]}
      />,
    );
    expect(screen.queryByText("Workspace")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Records" })).toHaveAttribute(
      "href",
      "/records",
    );
    expect(screen.getByText("New record")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
  it("keeps manual tab focus independent from selection and skips disabled tabs", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="one" activationMode="manual">
        <TabsList aria-label="Views">
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="disabled" disabled>
            Disabled
          </TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First panel</TabsContent>
        <TabsContent value="two">Second panel</TabsContent>
      </Tabs>,
    );
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Two" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.keyboard("{Enter}");
    expect(screen.getByRole("tabpanel", { name: "Two" })).toHaveTextContent(
      "Second panel",
    );
  });
  it("clamps pagination and never requests a page outside its result range", async () => {
    const change = vi.fn();
    render(
      <Pagination
        page={999}
        totalItems={24}
        pageSize={10}
        onPageChange={change}
      />,
    );
    expect(screen.getByText("Showing 21–24 of 24 records")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(change).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(change).toHaveBeenCalledExactlyOnceWith(2);
  });
  it("does not emit navigation for empty results or invalid pagination inputs", () => {
    render(
      <Pagination
        page={NaN}
        totalItems={-8}
        pageSize={0}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Showing 0–0 of 0 records")).toBeInTheDocument();
    for (const button of screen.getAllByRole("button"))
      expect(button).toBeDisabled();
  });
  it("only offers revisiting completed steps", async () => {
    const change = vi.fn();
    render(
      <Stepper
        currentStep={1}
        onStepChange={change}
        steps={[
          { id: "a", label: "Details" },
          { id: "b", label: "Access" },
          { id: "c", label: "Review" },
        ]}
      />,
    );
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getAllByRole("listitem")[1]).toHaveAttribute(
      "aria-current",
      "step",
    );
    await userEvent.click(screen.getByRole("button", { name: /Details/ }));
    expect(change).toHaveBeenCalledExactlyOnceWith(0);
  });
});

describe("Status and feedback contracts", () => {
  it("names avatars and derives initials from the first and last words", () => {
    render(<Avatar name="Alex Taylor Morgan" />);
    expect(
      screen.getByRole("img", { name: "Alex Taylor Morgan" }),
    ).toHaveTextContent("AM");
  });
  it("requires an explicit tag removal action and respects disabled removal", async () => {
    const remove = vi.fn();
    const { rerender } = render(
      <Tag onRemove={remove} removeLabel="Remove Operations">
        Operations
      </Tag>,
    );
    await userEvent.click(screen.getByText("Operations"));
    expect(remove).not.toHaveBeenCalled();
    await userEvent.click(
      screen.getByRole("button", { name: "Remove Operations" }),
    );
    expect(remove).toHaveBeenCalledOnce();
    rerender(
      <Tag disabled onRemove={remove}>
        Operations
      </Tag>,
    );
    expect(screen.getByRole("button", { name: "Remove tag" })).toBeDisabled();
  });
  it("makes alert announcements opt-in", () => {
    const { rerender } = render(
      <Alert title="Review required">Check workspace details.</Alert>,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    rerender(
      <Alert announcement="assertive" tone="danger" title="Save failed">
        Try again.
      </Alert>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Save failed");
  });
  it("normalizes progress values and leaves indeterminate progress without a current value", () => {
    const { rerender } = render(
      <Progress label="Upload" value={120} max={80} />,
    );
    expect(screen.getByRole("progressbar", { name: "Upload" })).toHaveAttribute(
      "aria-valuenow",
      "80",
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuetext",
      "100%",
    );
    rerender(<Progress label="Upload" value={-3} max={0} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuemax",
      "100",
    );
    rerender(<Progress label="Upload" value={NaN} />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute(
      "aria-valuenow",
    );
  });
  it("preserves a consumer-supplied progress label association", () => {
    render(
      <>
        <p id="external-progress-label">Workspace import</p>
        <Progress label="Upload" aria-labelledby="external-progress-label" />
      </>,
    );
    expect(
      screen.getByRole("progressbar", { name: "Workspace import" }),
    ).toBeInTheDocument();
  });
  it("keeps skeleton decoration out of the accessibility tree", () => {
    render(
      <section aria-label="Records" aria-busy="true">
        <Skeleton shape="card" />
      </section>,
    );
    expect(screen.getByRole("region", { name: "Records" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(
      within(screen.getByRole("region")).queryAllByRole("img"),
    ).toHaveLength(0);
  });
  it("lets the consumer perform the empty-state action", async () => {
    const create = vi.fn();
    render(
      <EmptyState
        title="No records"
        description="Create one to begin."
        action={<button onClick={create}>Create record</button>}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Create record" }),
    );
    expect(create).toHaveBeenCalledOnce();
  });
  it("runs a toast action once and closes the notification", async () => {
    const undo = vi.fn();
    const change = vi.fn();
    render(
      <ToastProvider>
        <Toast
          defaultOpen
          onOpenChange={change}
          title="Archived"
          action={{
            label: "Undo",
            altText: "Restore the record",
            onClick: undo,
          }}
        />
        <ToastViewport />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: /^Undo$/ }));
    expect(undo).toHaveBeenCalledOnce();
    expect(change).toHaveBeenCalledWith(false);
  });
});
