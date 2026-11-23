import { AssetIcon } from "../src/components/internal/AssetIcon";
import { useRef, useState, type MouseEvent } from "react";
import {
  Avatar,
  Breadcrumb,
  Button,
  CardFooter,
  Link,
  Navbar,
  NavbarSearch,
  Pagination,
  Sidebar,
  SidebarIdentity,
  Stepper,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Tag,
  type NavigationItemProps,
} from "../src";
import { Example, Section, Specimen } from "./components";
import leaf from "../src/assets/brand-leaf.svg";
import compactLeaf from "../src/assets/brand-leaf-compact.svg";
import wordmark from "../src/assets/brand-wordmark.svg";
import whiteLeaf from "../src/assets/brand-white-leaf.svg";
import whiteWordmark from "../src/assets/brand-white-wordmark.svg";
import panel from "../src/assets/nav-panel.svg";
import notifications from "../src/assets/nav-notifications.svg";
import connectivity from "../src/assets/nav-connectivity.svg";
import overview from "../src/assets/nav-overview-default.svg";
import overviewActive from "../src/assets/nav-overview-active.svg";
import records from "../src/assets/nav-records-default.svg";
import recordsActive from "../src/assets/nav-records-active.svg";
import planner from "../src/assets/nav-planner-default.svg";
import plannerActive from "../src/assets/nav-planner-active.svg";
import tracking from "../src/assets/nav-tracking-default.svg";
import trackingActive from "../src/assets/nav-tracking-active.svg";
import team from "../src/assets/nav-team-default.svg";
import teamActive from "../src/assets/nav-team-active.svg";
import importActive from "../src/assets/nav-import-active.svg";
import inbox from "../src/assets/nav-inbox-default.svg";
import help from "../src/assets/nav-help-default.svg";
import settings from "../src/assets/nav-settings-default.svg";
import tagLeft from "../src/assets/tag-left.svg";
import tagRight from "../src/assets/tag-right.svg";

const icon = (src: string) => <AssetIcon src={src} />;
const routes = [
  { label: "Overview", icon: icon(overview), activeIcon: icon(overviewActive) },
  { label: "Records", icon: icon(records), activeIcon: icon(recordsActive) },
  { label: "Planner", icon: icon(planner), activeIcon: icon(plannerActive) },
  { label: "Tracking", icon: icon(tracking), activeIcon: icon(trackingActive) },
  { label: "Team", icon: icon(team), activeIcon: icon(teamActive) },
];

// Preview navigation stays local. Modified clicks still behave like native links.
function selectRoute(event: MouseEvent<HTMLAnchorElement>, next: () => void) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  event.preventDefault();
  next();
}

export function Brand({
  compact = false,
  inverse = false,
}: {
  compact?: boolean;
  inverse?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label="Serenity"
      className={`relative block shrink-0 ${compact ? "size-10" : "h-10 w-[99px]"}`}
    >
      {/* Keep the original logo geometry; these are artwork offsets, not layout spacing. */}
      <img
        src={inverse ? whiteLeaf : compact ? compactLeaf : leaf}
        alt=""
        className={inverse ? "absolute" : "absolute sui-brand-light"}
        style={{ left: compact ? 9 : 9.0882, top: compact ? 4 : 4.04 }}
      />
      {!compact && (
        <img
          src={inverse ? whiteWordmark : wordmark}
          alt=""
          className={inverse ? "absolute" : "absolute sui-brand-light"}
          style={{ left: 27.9279, top: 16.852 }}
        />
      )}
      {!inverse && (
        <span className="sui-brand-dark" aria-hidden="true">
          <img
            src={whiteLeaf}
            alt=""
            className="absolute"
            style={{ left: compact ? 9 : 9.0882, top: compact ? 4 : 4.04 }}
          />
          {!compact && (
            <img
              src={whiteWordmark}
              alt=""
              className="absolute"
              style={{ left: 27.9279, top: 16.852 }}
            />
          )}
        </span>
      )}
    </span>
  );
}

function TagsExample() {
  const [tags, setTags] = useState(["Product team", "Operations"]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Tag
            key={tag}
            removeLabel={`Remove ${tag}`}
            onRemove={() => setTags(tags.filter((item) => item !== tag))}
          >
            {tag}
          </Tag>
        ))}
      </div>
      <CardFooter>
        <Button
          variant="secondary"
          onClick={() => setTags(["Product team", "Operations"])}
        >
          Reset tags
        </Button>
      </CardFooter>
      <p role="status" className="text-sui-body-sm">
        {tags.length} teams selected.
      </p>
    </div>
  );
}

function TabsExample() {
  return (
    <Tabs defaultValue="all" activationMode="manual">
      <TabsList aria-label="Record views">
        <TabsTrigger value="all">All records</TabsTrigger>
        <TabsTrigger value="assigned">Assigned to me</TabsTrigger>
        <TabsTrigger value="archived" disabled>
          Archived
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        All 24 records are available in this workspace.
      </TabsContent>
      <TabsContent value="assigned">You have 8 assigned records.</TabsContent>
      <TabsContent value="archived">Archived records.</TabsContent>
    </Tabs>
  );
}

function PaginationExample() {
  const [page, setPage] = useState(1);
  return (
    <div className="flex flex-col gap-4">
      <p role="status" className="text-sui-body-sm">
        Showing preview page {page}.
      </p>
      <Pagination
        aria-label="Preview results"
        page={page}
        pageSize={7}
        totalItems={70}
        onPageChange={setPage}
      />
    </div>
  );
}

function NavbarExample() {
  const [current, setCurrent] = useState("Overview");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("No search has been submitted.");
  const items = [
    routes[0],
    routes[1],
    routes[2],
    { ...routes[4], label: "Account" },
  ].map((item) => ({
    ...item,
    href: "#navbar",
    active: item.label === current,
    onClick: (event: MouseEvent<HTMLAnchorElement>) =>
      selectRoute(event, () => setCurrent(item.label)),
  }));
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Navbar
        leading={
          <Breadcrumb
            items={[
              { label: "Workspace", href: "#navbar" },
              { label: current },
            ]}
          />
        }
        items={items}
        search={
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setMessage(
                query.trim()
                  ? `Searching this preview for “${query}”.`
                  : "Enter a search term.",
              );
            }}
          >
            <NavbarSearch
              label="Search workspace"
              placeholder="Search anything…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>
        }
        actions={
          <>
            <Button
              variant="tertiary"
              aria-label="Show notifications"
              iconOnly
              className="size-10"
              onClick={() => setMessage("You have no new notifications.")}
            >
              {icon(notifications)}
            </Button>
            <span
              role="img"
              aria-label="Online"
              title="Online"
              className="flex size-10 items-center justify-center"
            >
              {icon(connectivity)}
            </span>
          </>
        }
      />
      <p role="status" className="text-sui-body-sm text-sui-text-secondary">
        Current view: {current}. {message}
      </p>
    </div>
  );
}

function SidebarPreview({
  compact = false,
  interactive = false,
}: {
  compact?: boolean;
  interactive?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(compact);
  const [current, setCurrent] = useState(
    interactive ? "Overview" : compact ? "Records" : "Import data",
  );
  const [message, setMessage] = useState("Navigation preview");
  const restore = useRef<HTMLButtonElement>(null);
  const expandedToggle = (
    <Button
      variant="tertiary"
      aria-label="Collapse sidebar"
      iconOnly
      className="size-10"
      onClick={() => {
        setCollapsed(true);
        restore.current?.focus();
      }}
    >
      {icon(panel)}
    </Button>
  );
  const items: Omit<NavigationItemProps, "layout">[] = routes.map((item) => ({
    ...item,
    href: "#sidebar",
    active: current === item.label,
    onClick: interactive
      ? (event) => selectRoute(event, () => setCurrent(item.label))
      : undefined,
  }));
  if (!interactive && !compact)
    items.push(
      {
        label: "Import data",
        href: "#sidebar",
        icon: null,
        activeIcon: icon(importActive),
        active: true,
      },
      {
        label: "Invitations",
        href: "#sidebar",
        icon: icon(team),
        activeIcon: icon(teamActive),
      },
      {
        label: "Inbox",
        href: "#sidebar",
        icon: icon(inbox),
        activeIcon: icon(notifications),
      },
    );
  const footerItems = [
    { label: "Help center", icon: icon(help) },
    { label: "Settings", icon: icon(settings) },
  ].map((item) => ({
    ...item,
    activeIcon: null,
    href: "#sidebar",
    onClick: (event: MouseEvent<HTMLAnchorElement>) =>
      selectRoute(event, () => setMessage(`${item.label} action selected.`)),
  }));
  return (
    <div className="flex min-w-0 flex-col items-start gap-4">
      {interactive && (
        <Button
          ref={restore}
          variant="secondary"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "Expand sidebar" : "Compact sidebar"}
        </Button>
      )}
      <Sidebar
        compact={collapsed}
        brand={<Brand />}
        compactBrand={<Brand compact />}
        toggle={interactive ? expandedToggle : undefined}
        items={items}
        footerItems={footerItems}
        className="min-h-[704px]"
        workspace={
          <SidebarIdentity
            name="Acme workspace"
            description="Business workspace"
            initials="AC"
            expandable
            compact={collapsed}
            onClick={() => setMessage("Acme workspace selected.")}
          />
        }
        account={
          <SidebarIdentity
            name="Alex Morgan"
            description="Workspace admin"
            initials="AM"
            compact={collapsed}
            onClick={() => setMessage("Alex Morgan account selected.")}
          />
        }
      />
      {interactive && (
        <p role="status" className="text-sui-body-sm">
          Current section: {current}. {message}.
        </p>
      )}
    </div>
  );
}

const steps = [
  { id: "upload", label: "Upload file", shortLabel: "Upload" },
  { id: "map", label: "Map fields" },
  { id: "review", label: "Review & import", shortLabel: "Review" },
];
function StepperExample() {
  const [step, setStep] = useState(0);
  return (
    <div className="flex flex-col gap-4">
      <Stepper steps={steps} currentStep={step} onStepChange={setStep} />
      <p role="status" className="text-sui-body-sm">
        {step === steps.length
          ? "Preview complete. No file was imported."
          : `Step ${step + 1}: ${steps[step].label}`}
      </p>
      <CardFooter>
        <Button onClick={() => setStep(step === steps.length ? 0 : step + 1)}>
          {step === steps.length ? "Restart steps" : "Continue step"}
        </Button>
        <Button
          variant="secondary"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          Previous step
        </Button>
      </CardFooter>
    </div>
  );
}

export function Navigation() {
  return (
    <>
      <Section
        name="Tag"
        description="Selected-value labels with optional icons and explicit removal."
      >
        <Specimen>
          <div className="flex flex-wrap items-center gap-2">
            <Tag>Product team</Tag>
            <Tag leftIcon={icon(tagLeft)} rightIcon={icon(tagRight)}>
              Product team
            </Tag>
            <Tag disabled>Product team</Tag>
          </div>
        </Specimen>
        <Example>
          <TagsExample />
        </Example>
      </Section>
      <Section
        name="Avatar"
        description="Initials for people and workspaces, with accessible names."
      >
        <Specimen>
          <div className="flex flex-wrap items-center gap-4">
            {([24, 32, 40, 48] as const).map((size) => (
              <Avatar key={size} size={size} name="Alex Morgan" />
            ))}
          </div>
        </Specimen>
        <Example>
          <div className="flex items-center gap-2">
            <Avatar name="Alex Morgan" size={40} aria-hidden />
            <div>
              <p className="text-sui-label-md">Alex Morgan</p>
              <p className="text-sui-caption-md text-sui-text-secondary">
                Workspace admin
              </p>
            </div>
          </div>
        </Example>
      </Section>
      <Section
        name="Link"
        description="Real navigation links with hover, keyboard focus and unavailable states."
      >
        <Specimen>
          <div className="flex flex-wrap gap-2">
            <Link href="#link">Forgot password?</Link>
            <Link href="#link" disabled>
              Unavailable link
            </Link>
          </div>
        </Specimen>
        <Example>
          <Link href="#input">Update profile details</Link>
        </Example>
      </Section>
      <Section
        name="Tabs"
        description="Panel navigation with independent selection and keyboard focus."
      >
        <Specimen>
          <Tabs defaultValue="all">
            <TabsList aria-label="Tab variants">
              <TabsTrigger value="all">All records</TabsTrigger>
              <TabsTrigger value="assigned">Assigned</TabsTrigger>
              <TabsTrigger value="disabled" disabled>
                Unavailable
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">All records view.</TabsContent>
            <TabsContent value="assigned">Assigned records view.</TabsContent>
            <TabsContent value="disabled">Unavailable.</TabsContent>
          </Tabs>
        </Specimen>
        <Example>
          <TabsExample />
        </Example>
      </Section>
      <Section
        name="Breadcrumb"
        description="Location context with the current page kept last."
      >
        <Specimen>
          <div className="flex flex-col gap-4">
            <Breadcrumb
              aria-label="Record breadcrumb"
              items={[
                { label: "All records", href: "#breadcrumb" },
                { label: "Create record" },
              ]}
            />
            <Breadcrumb
              compact
              aria-label="Compact breadcrumb"
              leadingAction={
                <Button
                  variant="tertiary"
                  aria-label="Show navigation preview"
                  iconOnly
                  onClick={() =>
                    document.getElementById("sidebar")?.scrollIntoView()
                  }
                  className="size-10"
                >
                  {icon(panel)}
                </Button>
              }
              items={[
                { label: "Workspace", href: "#breadcrumb" },
                { label: "Tracking" },
              ]}
            />
          </div>
        </Specimen>
        <Example>
          <Breadcrumb
            items={[
              { label: "Workspace", href: "#foundations" },
              { label: "Records", href: "#pagination" },
              { label: "Create record" },
            ]}
          />
        </Example>
      </Section>
      <Section
        name="Pagination"
        description="Result ranges and controlled page navigation, without changing the table."
      >
        <Specimen>
          <Pagination
            aria-label="Pagination specimen"
            page={1}
            totalItems={2480}
            pageSize={7}
            onPageChange={() => {}}
          />
          <Pagination
            aria-label="Empty pagination"
            page={1}
            totalItems={0}
            pageSize={7}
            onPageChange={() => {}}
          />
        </Specimen>
        <Example>
          <PaginationExample />
        </Example>
      </Section>
      <Section
        name="Navbar"
        description="Desktop context/actions and mobile navigation switch at the approved breakpoint."
      >
        <Specimen>
          <Navbar
            layout="desktop"
            leading={
              <Breadcrumb
                items={[
                  { label: "Workspace", href: "#navbar" },
                  { label: "Overview" },
                ]}
              />
            }
            search={
              <NavbarSearch
                label="Navbar search specimen"
                placeholder="Search anything…"
              />
            }
            actions={
              <>
                <Button
                  variant="tertiary"
                  aria-label="Notification specimen"
                  iconOnly
                  className="size-10"
                >
                  {icon(notifications)}
                </Button>
                <span
                  role="img"
                  aria-label="Online"
                  className="flex size-10 items-center justify-center"
                >
                  {icon(connectivity)}
                </span>
              </>
            }
            items={[]}
          />
          <Navbar
            layout="mobile"
            navigationLabel="Mobile navigation specimen"
            leading={null}
            items={[
              routes[0],
              routes[1],
              routes[2],
              { ...routes[4], label: "Account" },
            ].map((item, index) => ({
              ...item,
              href: "#navbar",
              active: index === 0,
            }))}
          />
        </Specimen>
        <Example>
          <NavbarExample />
        </Example>
      </Section>
      <Section
        name="Sidebar"
        description="Expanded and compact rails with paired navigation icons and elevated identity actions."
      >
        <Specimen>
          <div className="flex flex-wrap items-start gap-8">
            <SidebarPreview />
            <SidebarPreview compact />
          </div>
        </Specimen>
        <Example>
          <SidebarPreview interactive />
        </Example>
      </Section>
      <Section
        name="Stepper"
        description="Numbered progress with current, completed and upcoming steps."
      >
        <Specimen>
          <Stepper steps={steps} currentStep={1} />
        </Specimen>
        <Example>
          <StepperExample />
        </Example>
      </Section>
    </>
  );
}
