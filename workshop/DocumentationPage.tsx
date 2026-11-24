import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../src";
import { Section } from "./components";
import { CodeBlock } from "./CodeBlock";
import { repositoryHref } from "./site-config";
import { documentationGuides } from "./documentation-guides";
import api from "./generated/api-reference.json";
import contactSource from "./recipes/ContactForm.tsx?raw";
import attachmentSource from "./recipes/AttachmentSelection.tsx?raw";
import { ContactForm } from "./recipes/ContactForm";
import { AttachmentSelection } from "./recipes/AttachmentSelection";

function Topic({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-4 border-t border-sui-border-default pt-4">
      <h3 className="text-sui-heading-xs">{title}</h3>
      {children}
    </section>
  );
}
function GuideLink({ file, children }: { file: string; children: ReactNode }) {
  return (
    <a className="docs-text-link" href={`${repositoryHref}/blob/main/${file}`}>
      {children}
    </a>
  );
}

function ApiReference() {
  const [selected, setSelected] = useState("Button");
  const entry = api.find((item) => item.name === selected)!;
  return (
    <>
      <p>
        Select a module to inspect its actual TypeScript contract, including
        inherited native props, callbacks and related types. These declarations
        are generated from the package build and checked for drift in CI.
      </p>
      <Select label="API module" value={selected} onValueChange={setSelected}>
        {api.map((item) => (
          <option key={item.name} value={item.name}>
            {item.name}
          </option>
        ))}
      </Select>
      <p className="text-sui-body-sm text-sui-text-secondary">
        Import public exports from @serenity-ui/react. Relative paths inside
        declarations describe the package structure; they are not supported
        consumer import paths.
      </p>
      <h3 className="text-sui-heading-xs">{entry.name}</h3>
      <p className="break-words">
        <strong>Public exports:</strong> {entry.exports.join(", ")}. Related
        module declarations below do not add root exports.
      </p>
      <CodeBlock
        code={entry.declaration}
        label={`${entry.name} API declaration`}
      />
      <GuideLink file={entry.source}>
        Read {entry.name} implementation and defaults
      </GuideLink>
      <GuideLink file="docs/COMPONENTS.md">
        Read interaction contracts and component behavior
      </GuideLink>
      <GuideLink file="docs/API.md">
        Browse the complete API reference
      </GuideLink>
    </>
  );
}

function GettingStarted() {
  return (
    <>
      <p>
        Serenity UI is an MIT-licensed React 19 library for SaaS applications
        and dashboards. Start with the component workshop, then install a built
        archive in your application. Tokens are framework independent; Vue,
        Angular, Svelte and Astro adapters are not available yet.
      </p>
      <Topic title="Run the workshop">
        <CodeBlock
          label="Getting started commands"
          code={
            "git clone https://github.com/PolariSystem/sui-design-system.git\ncd sui-design-system\nnpm ci\nnpm run dev"
          }
        />
        <p>
          Use a supported Node version from package.json and the committed
          lockfile. On Windows, use npm.cmd if PowerShell blocks npm.ps1. The
          workshop previews components; it does not supply your application's
          backend.
        </p>
      </Topic>
      <Topic title="Build your first screen">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <a className="docs-text-link" href="#documentation/installation">
              Install the archive and load CSS and DM Sans.
            </a>
          </li>
          <li>
            <a className="docs-text-link" href="#documentation/theming">
              Set the theme on the document so portaled surfaces inherit it.
            </a>
          </li>
          <li>
            <a className="docs-text-link" href="#documentation/forms">
              Connect native form values and map server errors.
            </a>
          </li>
          <li>
            <a className="docs-text-link" href="#documentation/integration">
              Run the HTTP reference app and adapt its integration boundaries.
            </a>
          </li>
        </ol>
        <p>
          Use the component index for visual states and the Component API guide
          for exact props. Examples compose the same public controls you
          install.
        </p>
      </Topic>
      <GuideLink file="docs/ADOPTION.md">Read the adoption checklist</GuideLink>
    </>
  );
}

function Installation() {
  return (
    <>
      <p>
        No npm registry release has been published. Build an archive from the
        repository and install it in a React 19 application; do not rely on an
        unverified registry package with a similar name.
      </p>
      <Topic title="Build and install">
        <CodeBlock
          code={
            "# In the kit checkout\nnpm ci\nnpm run pack:local\n\n# In your React application (replace the path)\nnpm install /absolute/path/to/serenity-ui-react-0.2.0.tgz\nnpm install @fontsource-variable/dm-sans"
          }
          label="Archive installation commands"
        />
        <p>
          The archive name follows the package version. A phase number does not
          imply a new release. The prepack hook rebuilds tokens, JavaScript, CSS
          and declarations.
        </p>
      </Topic>
      <Topic title="Application entry">
        <CodeBlock
          code={
            'import "@fontsource-variable/dm-sans";\nimport "@serenity-ui/react/styles.css";\nimport { Button } from "@serenity-ui/react";\n\nexport function App() {\n  return <Button onClick={() => console.log("Save requested")}>Save</Button>;\n}'
          }
        />
        <p>
          Import CSS once before your overrides. The compiled entry works
          without a Tailwind compiler and includes Preflight. If your
          application already supplies a compatible reset, choose
          styles-no-preflight.css instead. It is not CSS isolation: theme
          variables and utility classes remain shared.
        </p>
      </Topic>
      <Topic title="Tailwind and server rendering">
        <CodeBlock
          code={
            '@import "tailwindcss";\n@import "@serenity-ui/react/theme.css";'
          }
          label="Tailwind theme imports"
        />
        <p>
          The theme entry enables Tailwind 4 utilities in applications that
          compile Tailwind. Keep one compiled component CSS entry as well. React
          and React DOM remain peer dependencies. Use a client boundary for
          interactive components in server-rendered frameworks; the isolated
          consumer verifies representative SSR and hydration, not every
          framework or streaming configuration.
        </p>
      </Topic>
      <GuideLink file="docs/INSTALLATION.md">
        Read installation and distribution details
      </GuideLink>
    </>
  );
}

function Theming() {
  return (
    <>
      <p>
        Set data-sui-theme="light" or "dark" on html. The library defaults to
        Light and does not read storage or choose a browser preference. Your
        application owns that policy.
      </p>
      <CodeBlock
        code={'document.documentElement.dataset.suiTheme = "dark";'}
        label="Theme boundary"
      />
      <Topic title="Portals share the document theme">
        <p>
          Dialog, Drawer, Select, Popover and Tooltip can mount outside their
          triggering container. A theme on a nested card does not reach a portal
          under body. Apply the global theme before paint and keep server and
          client initialization consistent.
        </p>
      </Topic>
      <Topic title="Compose with semantic tokens">
        <CodeBlock
          code={
            ".workspace {\n  display: grid;\n  gap: var(--sui-space-4);\n  padding: var(--sui-space-4);\n  background: var(--sui-color-surface-canvas);\n  color: var(--sui-color-text-primary);\n}"
          }
          label="Semantic layout tokens"
        />
        <p>
          Use semantic surface, text, icon, border and status roles. Spacing and
          geometry use the four-pixel scale; action groups use 8 px. Cards over
          canvas retain elevation. Text grows with content, and mobile heading
          tokens adapt below 640 px.
        </p>
        <p>
          Overrides must preserve contrast in both themes and across hover,
          focus, selected and error states. When changing shared tokens, update
          Figma, export figma-tokens.json and run npm run tokens; do not
          hand-edit generated CSS.
        </p>
      </Topic>
      <GuideLink file="docs/THEMING.md">
        Read theme boundaries and token maintenance
      </GuideLink>
    </>
  );
}

function Forms() {
  return (
    <>
      <p>
        Input and Textarea keep native names, refs, validation and events.
        Checkbox, Radio and Switch contribute checked values. Select and pickers
        expose their own value callbacks; use their public types rather than
        assuming every control emits a ChangeEvent.
      </p>
      <Topic title="A typed form boundary">
        <p>
          This preview uses a local success response. In your application,
          supply save to call your service and translate its validation errors
          into ContactResult. The same component below is compiled as part of
          the workshop.
        </p>
        <ContactForm save={async () => ({ ok: true })} />
        <CodeBlock code={contactSource} label="Contact form recipe" />
      </Topic>
      <Topic title="Value and error ownership">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Choose controlled value plus change callback, or defaultValue for
            native ownership. Do not switch modes during a mounted control's
            lifetime.
          </li>
          <li>
            Use FormData.getAll for multiple selection and repeated names.
            Unchecked checkboxes and disabled native controls are omitted from
            form submission.
          </li>
          <li>
            Pass errors through the field's error prop, preserve input after
            failure and move focus to the first actionable error. Native
            required/type checks complement server validation.
          </li>
          <li>
            Use refs on native inputs and triggerProps.ref on Select/date/time
            picker triggers. Do not place interactive buttons in decorative icon
            slots.
          </li>
        </ul>
      </Topic>
      <GuideLink file="docs/INTEGRATION.md">
        Read native forms, refs and server validation
      </GuideLink>
    </>
  );
}

function Integration() {
  return (
    <>
      <p>
        The reference application connects the actual package to a local HTTP
        service. It exercises server field validation, remote table requests,
        dashboard persistence with conflict handling, and file upload. Run it
        separately from the visual workshop.
      </p>
      <CodeBlock
        code="npm run example:integration"
        label="HTTP example command"
      />
      <Topic title="Ownership boundaries">
        <Table label="Integration ownership boundaries">
          <TableHeader>
            <TableRow>
              <TableHead>Workflow</TableHead>
              <TableHead>Kit</TableHead>
              <TableHead>Application</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              [
                "Forms",
                "Values, refs, field errors and loading controls",
                "Service calls, validation rules and persistence",
              ],
              [
                "DataTable",
                "Visible rows, selection, sort/page requests and feedback",
                "Query parameters, row IDs, total count and stale-request protection",
              ],
              [
                "Dashboard",
                "Controlled layout, drag preview and keyboard editing",
                "Profile ownership, version conflicts and saved layouts",
              ],
              [
                "Authentication",
                "Access forms and explicit states",
                "Sessions, tokens, authorization and recovery service",
              ],
              [
                "Upload",
                "Selection, rejection, progress and actions",
                "Transport, queue, cancellation, content validation and storage",
              ],
            ].map(([flow, kit, app]) => (
              <TableRow key={flow}>
                <TableCell>{flow}</TableCell>
                <TableCell>{kit}</TableCell>
                <TableCell>{app}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Topic>
      <Topic title="Remote data and failure recovery">
        <p>
          DataTable receives the visible page, stable row IDs, totalItems and
          requested sort. It does not fetch or sort your backend data. Abort
          superseded reads, ignore stale responses, reset pagination when
          filters change and keep selected IDs independent of the current page.
        </p>
        <p>
          Show loading, empty, failed and successful states explicitly. Confirm
          a save only after the service accepts it. A cancelled client request
          does not prove the server rolled back a write. The example's versioned
          dashboard endpoint returns conflicts rather than silently overwriting
          newer data.
        </p>
      </Topic>
      <GuideLink file="docs/INTEGRATION.md">
        Read the integration guide
      </GuideLink>
      <GuideLink file="examples/integration/RemoteRecords.tsx">
        Read the remote table implementation
      </GuideLink>
      <GuideLink file="examples/integration/README.md">
        Run and inspect the reference service
      </GuideLink>
    </>
  );
}

function Uploads() {
  return (
    <>
      <p>
        FileUpload selects File objects; FileUploadItem renders an
        application-owned queue entry. Neither component starts a network
        request. Keep file state and upload state separate.
      </p>
      <Topic title="Select and remove">
        <AttachmentSelection />
        <CodeBlock code={attachmentSource} label="File selection recipe" />
        <p>
          accept, maxSize and maxFiles are client-side selection constraints.
          maxSize is bytes per file; maxFiles applies to a single selection.
          Enforce the total queue limit in your application. Localize labels and
          rejectionMessage as needed.
        </p>
      </Topic>
      <Topic title="Transfer and completion">
        <p>
          Use queued → uploading → success after an accepted response. Failed
          requests become error; explicit cancellation becomes cancelled. Retry
          creates a fresh request. A transport progress value of 100 means bytes
          were sent, not that the service accepted or persisted the file. Omit
          progress for an indeterminate transfer.
        </p>
        <p>
          The HTTP example uses XMLHttpRequest upload progress and
          AbortController cancellation. It validates CSV contents up to 1 MiB
          and returns a digest without retaining files. Adapt the transport to
          your multipart or signed-upload service; enforce authorization, size
          limits and content validation on that service.
        </p>
      </Topic>
      <GuideLink file="docs/FILE-UPLOAD.md">
        Read upload API, validation and transport guidance
      </GuideLink>
      <GuideLink file="examples/integration/UploadFiles.tsx">
        Read the queue and retry implementation
      </GuideLink>
      <GuideLink file="examples/integration/upload.ts">
        Read the upload transport
      </GuideLink>
    </>
  );
}

function Motion() {
  return (
    <>
      <p>
        Use shared motion to communicate state changes without delaying controls
        or focus. Semantic state changes immediately; decoration can settle
        afterward.
      </p>
      <Topic title="Shared timing">
        <ul className="list-disc space-y-2 pl-5">
          <li>Respond: 120 ms for press and short feedback.</li>
          <li>Settle: 240 ms for transitions between control states.</li>
          <li>
            Reveal: 800 ms for surfaces; reading content enters over two Reveal
            intervals, 1,600 ms.
          </li>
          <li>
            Charts keep axes, labels and data alternatives final while marks and
            decorative counters animate from zero.
          </li>
        </ul>
        <p>
          Prefer opacity and transforms. Do not animate layout or apply
          transition: all. Respect prefers-reduced-motion; focus, keyboard
          interaction and meaningful content must remain available immediately.
        </p>
      </Topic>
      <a className="docs-text-link" href="#motion">
        Try the motion studies
      </a>
      <GuideLink file="docs/MOTION.md">
        Read the motion implementation contract
      </GuideLink>
    </>
  );
}

function Accessibility() {
  return (
    <>
      <p>
        The kit supplies accessible primitives, but the final application must
        preserve their semantics and verify the complete workflow with its own
        content.
      </p>
      <Topic title="Name and compose controls">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Give IconButton an action-specific accessible name; include the
            record name for repeated row actions.
          </li>
          <li>
            Keep field labels associated with controls. Do not use a placeholder
            as the only label.
          </li>
          <li>
            Dialog and Drawer need meaningful titles. Restore focus when
            closing, removing a queue row or replacing a control.
          </li>
          <li>
            Pair status colors with text. Use the chart's semantic data
            alternative and preserve table header relationships.
          </li>
        </ul>
      </Topic>
      <Topic title="Validate the full workflow">
        <p>
          Test keyboard order, Enter/Space activation, Escape dismissal, visible
          focus, zoom and long text. Check Light and Dark, narrow mobile widths,
          reduced motion and failure recovery. Automated axe and contrast checks
          are useful regression signals; they do not certify all browsers,
          screen readers or application compositions.
        </p>
        <CodeBlock
          code="npm run test:browser\nnpm run test:integration"
          label="Interaction verification commands"
        />
      </Topic>
      <GuideLink file="docs/COMPONENTS.md">
        Read component semantics and keyboard behavior
      </GuideLink>
    </>
  );
}

function Maintenance() {
  return (
    <>
      <p>
        Pin the package/archive version and review release notes before
        upgrading. The current distribution is ESM with React 19 peers. Tokens
        can be consumed independently; other component adapters and broad
        framework certification remain pending.
      </p>
      <Topic title="Verify an update">
        <CodeBlock
          code="npm ci\nnpm run check\nnpm run check:package\nnpm run test:browser\nnpm run test:integration"
          label="Adoption verification commands"
        />
        <p>
          The packed consumer installs an actual archive outside the repository,
          checks strict public types, renders on the server, hydrates and
          exercises desktop/mobile interactions without a Tailwind compiler. Its
          coverage is representative, not an assurance for every deployment.
        </p>
      </Topic>
      <Topic title="Keep design and documentation aligned">
        <p>
          Update approved Figma components and variables, implement shared
          primitives, add meaningful behavior tests and update the appropriate
          guide. Run npm run docs:generate after public API changes; CI rejects
          stale generated declarations. Record delivered work and remaining
          limitations in the phase record and Unreleased notes. A phase does not
          automatically publish a package.
        </p>
      </Topic>
      <GuideLink file="docs/STATUS.md">
        Check the implementation inventory
      </GuideLink>
      <GuideLink file="docs/releases/unreleased.md">
        Read upcoming changes
      </GuideLink>
      <GuideLink file="CONTRIBUTING.md">Read contribution guidance</GuideLink>
    </>
  );
}

const articles: Record<string, () => ReactNode> = {
  "": GettingStarted,
  installation: Installation,
  components: ApiReference,
  theming: Theming,
  forms: Forms,
  integration: Integration,
  uploads: Uploads,
  motion: Motion,
  accessibility: Accessibility,
  maintenance: Maintenance,
};

/** One guide mounts at a time; the existing shell owns responsive navigation. */
export default function DocumentationPage({ fragment }: { fragment: string }) {
  const article = useRef<HTMLElement>(null);
  const requested = fragment.replace(/^#/, "").split("/")[1] ?? "";
  const guide = documentationGuides.find((item) => item.id === requested);
  const Content = guide ? articles[guide.id] : null;
  useEffect(() => {
    document.title = `${guide?.name ?? "Guide not found"} · Serenity UI`;
    // A lazily loaded article can mount after the shell's navigation frame.
    // Own deep-link focus here so direct visits and history navigation agree.
    if (requested) {
      article.current?.focus({ preventScroll: true });
      article.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [requested, guide]);
  return (
    <Section
      name="Documentation"
      description="Install, compose and connect Serenity UI in your application."
    >
      <article
        ref={article}
        id={`documentation-${guide?.id || "start"}`}
        tabIndex={-1}
        className="flex min-w-0 flex-col gap-4 text-sui-body-md text-sui-text-body"
      >
        <h2 className="text-sui-heading-md">
          {guide?.name ?? "Guide not found"}
        </h2>
        {Content ? (
          <Content />
        ) : (
          <a className="docs-text-link" href="#documentation">
            Return to getting started
          </a>
        )}
      </article>
    </Section>
  );
}
