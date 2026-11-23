import { useRef, useState, type FormEvent } from "react";
import {
  Avatar,
  Badge,
  Button,
  CardFooter,
  Checkbox,
  DatePicker,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
  Select,
  Sidebar,
  SidebarIdentity,
  Textarea,
  Tooltip,
  TooltipProvider,
} from "../src";
import { Example, Section, Specimen } from "./components";
import { Brand } from "./Navigation";
import reset from "../src/assets/dialog-reset.svg";
import close from "../src/assets/overlay-close.svg";
import pin from "../src/assets/location-pin.svg";
import folder from "../src/assets/drawer-folder.svg";
import unread from "../src/assets/notification-unread.svg";
import clock from "../src/assets/notification-clock.svg";
import file from "../src/assets/notification-file.svg";
import download from "../src/assets/notification-download.svg";
import add from "../src/assets/notification-add.svg";
import mail from "../src/assets/notification-mail.svg";
import send from "../src/assets/notification-send.svg";
import overview from "../src/assets/nav-overview-default.svg";
import overviewActive from "../src/assets/nav-overview-active.svg";
import records from "../src/assets/nav-records-default.svg";
import recordsActive from "../src/assets/nav-records-active.svg";
const icon = (src: string) => <img src={src} alt="" />;

function ConfirmExample({ featured = false }: { featured?: boolean }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("No changes made.");
  const cancel = useRef<HTMLButtonElement>(null);
  return (
    <div className="flex flex-col gap-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary">
            {featured ? "Reset dashboard layout" : "Archive preview record"}
          </Button>
        </DialogTrigger>
        <DialogContent
          title={featured ? "Reset dashboard layout?" : "Archive this record?"}
          description={
            featured
              ? "Restore the default widget arrangement. Your data and records will stay available."
              : "You can restore this record from the archive at any time."
          }
          variant={featured ? "featured" : "standard"}
          icon={featured ? icon(reset) : undefined}
          showClose={!featured}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            cancel.current?.focus();
          }}
          footer={
            <CardFooter>
              <Button
                onClick={() => {
                  setMessage(
                    featured
                      ? "Preview layout restored."
                      : "Preview record archived.",
                  );
                  setOpen(false);
                }}
              >
                {featured ? "Reset layout" : "Archive record"}
              </Button>
              <DialogClose asChild>
                <Button ref={cancel} variant="secondary">
                  {featured ? "Keep layout" : "Cancel"}
                </Button>
              </DialogClose>
            </CardFooter>
          }
        />
      </Dialog>
      <p role="status" className="text-sui-body-sm">
        {message}
      </p>
    </div>
  );
}

function RecordForm({ onSaved }: { onSaved?: (name: string) => void }) {
  const [priority, setPriority] = useState("Normal");
  const [message, setMessage] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("recordName"));
    setMessage(`${name} saved in this preview.`);
    onSaved?.(name);
  };
  return (
    <form onSubmit={submit} className="flex min-w-0 flex-col gap-4">
      <Input
        label="Record name"
        name="recordName"
        defaultValue="Workspace onboarding"
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Select label="Category" defaultValue="operations">
          <option value="operations">Operations</option>
          <option value="product">Product</option>
        </Select>
        <Select label="Owner" defaultValue="alex">
          <option value="alex">Alex Morgan</option>
          <option value="jamie">Jamie Chen</option>
        </Select>
        <Select label="Status" defaultValue="progress">
          <option value="progress">In progress</option>
          <option value="complete">Complete</option>
        </Select>
        <DatePicker label="Due date" name="dueDate" defaultValue="2026-10-16" />
      </div>
      <Textarea
        label="Description"
        defaultValue="Set up workspace access, confirm responsibilities and share the resources needed for a smooth start."
        rows={4}
      />
      <fieldset>
        <legend className="mb-2 text-sui-label-md">Priority</legend>
        <div className="flex gap-2">
          {["Low", "Normal", "High"].map((value) => (
            <Button
              key={value}
              variant={value === priority ? "primary" : "secondary"}
              aria-pressed={priority === value}
              onClick={() => setPriority(value)}
            >
              {value}
            </Button>
          ))}
        </div>
      </fieldset>
      <hr className="border-sui-border-default" />
      <label className="flex flex-col items-center gap-2 rounded-sui-card bg-sui-surface-canvas p-5 text-sui-body-sm">
        {icon(folder)}
        <span>Choose a preview attachment</span>
        <span className="text-sui-caption-sm text-sui-text-secondary">
          PDF, PNG or JPG · Kept on your device
        </span>
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          aria-label="Preview attachment"
          className="max-w-full text-sui-caption-sm"
        />
      </label>
      <Checkbox
        label="Notify the owner when this record is created"
        defaultChecked
      />
      <CardFooter>
        <Button type="submit">Save record</Button>
      </CardFooter>
      {message && (
        <p role="status" className="text-sui-body-sm">
          {message}
        </p>
      )}
    </form>
  );
}
function NotificationContent() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const attachment = useRef<HTMLInputElement>(null);
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <CardFooter>
        <Badge tone="info">Mention</Badge>
        <Button
          variant="secondary"
          leftIcon={icon(unread)}
          onClick={() => setMessage("Notification marked as read.")}
        >
          Mark as read
        </Button>
        <Button
          variant="secondary"
          leftIcon={icon(clock)}
          onClick={() => setMessage("Snoozed for this preview session.")}
        >
          Snooze
        </Button>
      </CardFooter>
      <h3 className="text-sui-heading-md">Workspace onboarding</h3>
      <div className="flex items-center gap-3">
        <Avatar name="Jamie Chen" />
        <div>
          <p className="text-sui-label-lg">Jamie Chen mentioned you</p>
          <p className="mt-1 text-sui-caption-md text-sui-text-secondary">
            Today at 10:24 · Product team
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-sui-card bg-sui-surface-canvas p-5 text-sui-body-md">
        <p className="text-sui-text-link">@Alex Morgan</p>
        <p>
          The onboarding checklist is ready for review. Could you confirm the
          access requirements before we share it with the team?
        </p>
      </div>
      <div className="flex items-center gap-3 rounded-sui-card border border-sui-border-default p-4">
        {icon(file)}
        <div className="min-w-0 flex-1">
          <p className="break-words text-sui-label-md">
            Onboarding-checklist.txt
          </p>
          <p className="text-sui-caption-md text-sui-text-secondary">
            Preview attachment
          </p>
        </div>
        <Button
          variant="tertiary"
          iconOnly
          aria-label="Download preview checklist"
          onClick={() => {
            const url = URL.createObjectURL(
              new Blob(
                [
                  "Workspace onboarding\nConfirm access requirements.\nAssign responsibilities.\n",
                ],
                { type: "text/plain" },
              ),
            );
            const a = document.createElement("a");
            a.href = url;
            a.download = "onboarding-checklist.txt";
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          {icon(download)}
        </Button>
      </div>
      <h4 className="text-sui-heading-xs">Recent activity</h4>
      {[
        ["TR", "Taylor added the checklist", "09:40"],
        ["JC", "Jamie asked for your review", "10:24"],
      ].map(([initials, text, time]) => (
        <div
          key={time}
          className="flex items-center gap-3 text-sui-caption-md text-sui-text-secondary"
        >
          <Avatar size={24} name={text} initials={initials} aria-hidden />
          <p className="flex-1">{text}</p>
          <time>{time}</time>
        </div>
      ))}
      <hr className="border-sui-border-default" />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setMessage(
            reply.trim()
              ? "Reply saved in this preview. No message was sent."
              : "Write a reply first.",
          );
        }}
        className="flex flex-col gap-3 rounded-sui-card border border-sui-border-control p-3"
      >
        <Textarea
          label="Reply"
          hideLabel
          placeholder="Write a reply…"
          value={reply}
          onChange={(event) => setReply(event.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="tertiary"
            iconOnly
            aria-label="Attach to preview reply"
            onClick={() => attachment.current?.click()}
          >
            {icon(add)}
          </Button>
          <span aria-hidden>{icon(mail)}</span>
          <p className="text-sui-caption-sm text-sui-text-secondary">
            Use @ to mention a teammate
          </p>
          <input
            ref={attachment}
            type="file"
            className="sr-only"
            tabIndex={-1}
            aria-label="Reply attachment"
            onChange={() => setMessage("Attachment selected locally.")}
          />
        </div>
        <CardFooter>
          <Button type="submit" leftIcon={icon(send)}>
            Send reply
          </Button>
        </CardFooter>
      </form>
      <p role="status" className="text-sui-body-sm">
        {message}
      </p>
    </div>
  );
}
function DrawerExample() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("No record changes.");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button>Open record panel</Button>
          </DrawerTrigger>
          <DrawerContent
            title="Record details"
            description="Add the information your team needs to get started."
          >
            <RecordForm
              onSaved={(name) => {
                setMessage(`${name} saved in this preview.`);
                setOpen(false);
              }}
            />
          </DrawerContent>
        </Drawer>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="secondary">Open notification panel</Button>
          </DrawerTrigger>
          <DrawerContent title="Notification">
            <NotificationContent />
          </DrawerContent>
        </Drawer>
      </div>
      <p role="status" className="text-sui-body-sm">
        {message}
      </p>
    </div>
  );
}
function NavigationDrawer() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("Overview");
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="secondary">Open mobile navigation</Button>
      </DrawerTrigger>
      <DrawerContent title="Workspace navigation" side="left" size="navigation">
        <Sidebar
          brand={<Brand />}
          workspace={<SidebarIdentity name="Acme workspace" initials="AC" />}
          account={<SidebarIdentity name="Alex Morgan" initials="AM" />}
          items={[
            {
              label: "Overview",
              icon: icon(overview),
              activeIcon: icon(overviewActive),
            },
            {
              label: "Records",
              icon: icon(records),
              activeIcon: icon(recordsActive),
            },
          ].map((item) => ({
            ...item,
            href: `#${item.label.toLowerCase()}`,
            active: item.label === current,
            onClick: (event) => {
              event.preventDefault();
              setCurrent(item.label);
              setOpen(false);
            },
          }))}
          className="min-h-[480px]"
        />
      </DrawerContent>
    </Drawer>
  );
}
function LocationExample() {
  const [following, setFollowing] = useState(false);
  const [details, setDetails] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary">Show current location</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Current location">
          <div className="flex items-center gap-2">
            {icon(pin)}
            <p className="text-sui-label-md">Current location</p>
          </div>
          <p className="text-sui-caption-md text-sui-text-secondary">
            Riverside checkpoint
          </p>
          <p className="text-sui-caption-sm text-sui-text-secondary">
            13:10 · 18.4 km remaining
          </p>
          <CardFooter>
            <Button
              aria-pressed={following}
              onClick={() => setFollowing(!following)}
            >
              {following ? "Following" : "Follow"}
            </Button>
            <PopoverClose asChild>
              <Button variant="secondary" onClick={() => setDetails(true)}>
                Details
              </Button>
            </PopoverClose>
          </CardFooter>
        </PopoverContent>
      </Popover>
      <p role="status" className="text-sui-body-sm">
        {details
          ? "Riverside checkpoint: delivery is on schedule."
          : following
            ? "Following Riverside checkpoint in this preview."
            : "Location updates are paused."}
      </p>
    </div>
  );
}
function MenuExample() {
  const [message, setMessage] = useState("No action selected.");
  return (
    <div className="flex flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">Record actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent aria-label="Record actions">
          <DropdownMenuItem
            onSelect={() => setMessage("Editing the preview record.")}
          >
            Edit record
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              setMessage("A duplicate preview record was created.")
            }
          >
            Duplicate record
          </DropdownMenuItem>
          <DropdownMenuItem
            danger
            onSelect={() => setMessage("Preview record archived.")}
          >
            Archive record
          </DropdownMenuItem>
          <DropdownMenuItem disabled>Export record</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <p role="status" className="text-sui-body-sm">
        {message}
      </p>
    </div>
  );
}

export function Overlays() {
  return (
    <>
      <Section
        name="Dialog"
        description="Named modal confirmations with safe initial focus and focus restoration."
      >
        <Specimen>
          <div className="grid gap-4 lg:grid-cols-2">
            {[false, true].map((featured) => (
              <div
                key={String(featured)}
                className="flex flex-col gap-5 rounded-sui-lg border border-sui-border-default bg-sui-surface-default p-4 shadow-sui-elevation-floating"
              >
                <div className="flex items-start gap-4">
                  {featured && icon(reset)}
                  <p
                    className={`flex-1 ${featured ? "text-sui-heading-md" : "text-sui-heading-xs"}`}
                  >
                    {featured
                      ? "Reset dashboard layout?"
                      : "Archive this record?"}
                  </p>
                  {!featured && icon(close)}
                </div>
                <p className="text-sui-body-sm text-sui-text-secondary">
                  {featured
                    ? "Restore the default widget arrangement. Your data and records will stay available."
                    : "You can restore this record from the archive at any time."}
                </p>
                <ConfirmExample featured={featured} />
              </div>
            ))}
          </div>
        </Specimen>
        <Example>
          <ConfirmExample />
        </Example>
      </Section>
      <Section
        name="Drawer"
        description="Record and notification panels with internal scrolling, plus mobile navigation."
      >
        <Specimen>
          <div className="max-w-[736px]">
            <h3 className="mb-4 text-sui-heading-sm">Record details</h3>
            <RecordForm />
          </div>
        </Specimen>
        <Example>
          <div className="flex flex-col gap-4">
            <DrawerExample />
            <NavigationDrawer />
          </div>
        </Example>
      </Section>
      <Section
        name="Tooltip"
        description="Supplementary text appears on hover or keyboard focus; essential information stays visible."
      >
        <Specimen>
          <p className="text-sui-body-sm">
            Hover or focus the action to read its description.
          </p>
          <TooltipProvider>
            <Tooltip content="Copy a link to this workspace">
              <Button variant="secondary" onClick={() => {}}>
                Copy link specimen
              </Button>
            </Tooltip>
          </TooltipProvider>
        </Specimen>
        <Example>
          <TooltipProvider>
            <Tooltip content="Archive a record without deleting it">
              <Button variant="secondary">Archive help</Button>
            </Tooltip>
          </TooltipProvider>
        </Example>
      </Section>
      <Section
        name="Popover"
        description="The approved location preview uses interactive popover semantics."
      >
        <Specimen>
          <div className="flex w-60 max-w-full flex-col gap-2 rounded-sui-card border border-sui-border-default p-4 shadow-sui-elevation-floating">
            <div className="flex items-center gap-2">
              {icon(pin)}
              <p className="text-sui-label-md">Current location</p>
            </div>
            <p className="text-sui-caption-md text-sui-text-secondary">
              Riverside checkpoint
            </p>
            <p className="text-sui-caption-sm text-sui-text-secondary">
              13:10 · 18.4 km remaining
            </p>
            <CardFooter>
              <Button>Follow</Button>
              <Button variant="secondary">Details</Button>
            </CardFooter>
          </div>
        </Specimen>
        <Example>
          <LocationExample />
        </Example>
      </Section>
      <Section
        name="DropdownMenu"
        description="Items-only action menus with arrows, typeahead, disabled actions and Escape dismissal."
      >
        <Specimen>
          <div className="sui-action-menu rounded-sui-card border border-sui-border-default shadow-sui-elevation-floating">
            <p className="sui-menu-item">Edit record</p>
            <p className="sui-menu-item">Duplicate record</p>
            <p className="sui-menu-item">Archive record</p>
          </div>
        </Specimen>
        <Example>
          <MenuExample />
        </Example>
      </Section>
    </>
  );
}
