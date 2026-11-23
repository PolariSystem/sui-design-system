/** Stable fragment routes preserve links shared from the original workshop. */
export const groups = [
  { title: "Start here", names: ["Foundations", "Motion", "Documentation"] },
  {
    title: "Actions & inputs",
    names: [
      "Button",
      "IconButton",
      "Input",
      "Textarea",
      "Select",
      "Radio",
      "Switch",
      "OTPInput",
      "PasswordInput",
      "Checkbox",
    ],
  },
  {
    title: "Structure & navigation",
    names: [
      "Badge",
      "Card",
      "ScrollArea",
      "Tag",
      "Avatar",
      "Link",
      "Tabs",
      "Breadcrumb",
      "Pagination",
      "Navbar",
      "Sidebar",
      "Stepper",
    ],
  },
  {
    title: "Feedback & overlays",
    names: [
      "Alert",
      "Toast",
      "Progress",
      "Skeleton",
      "EmptyState",
      "Dialog",
      "Drawer",
      "Tooltip",
      "Popover",
      "DropdownMenu",
    ],
  },
  {
    title: "Dates & data",
    names: [
      "DatePicker",
      "TimePicker",
      "Calendar",
      "DataTable",
      "Chart",
      "Widget",
    ],
  },
  { title: "Concepts", names: ["Dashboard", "SignInForm"] },
] as const;

export const catalog = groups.flatMap((group) =>
  group.names.map((name) => ({
    name,
    id: name.toLowerCase(),
    group: group.title,
  })),
);

/** Resolve a catalog destination from the website's shared navigation state. */
export function resolveRoute(fragment: string) {
  const id = fragment.slice(1).split("/")[0].toLowerCase();
  return (
    catalog.find((item) => item.id === id)?.id ??
    (id && id !== "main" ? "not-found" : "foundations")
  );
}
