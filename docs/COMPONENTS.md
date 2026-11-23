# Component API

All components use the semantic Serenity tokens in Light and Dark modes. Native HTML props are forwarded unless explicitly replaced. Text can grow; icon slots are optional and occupy no space when omitted. See [application integration](./INTEGRATION.md) for form contracts, refs, server errors, remote data and persistence.

| Component  | Main props                                                                                             | Native behavior                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Button     | variant: primary/secondary/tertiary/danger; size: sm/md/lg; loading; loadingLabel; leftIcon; rightIcon | Native button, defaults to type=button; loading disables repeated activation and exposes aria-busy                             |
| Input      | required label; hideLabel; helperText; error; size: standard/compact; leftIcon; rightIcon              | Native input; use value/onChange or defaultValue; label and error are associated; ref forwarded to input (React 19)            |
| Checkbox   | required label; indeterminate; size: 16/20 (default 20) | Native checkbox; value/name participate in forms; checked/onChange or defaultChecked; Space toggles; disabled skips submission |
| Badge      | tone: neutral/info/success/warning/danger; size: sm/md; leftIcon; rightIcon                            | Noninteractive status text; no misleading live region by default                                                               |
| Card       | padding: compact/default/comfortable; elevation: subtle/floating                                       | Generic container; the consumer chooses headings and semantic context                                                          |
| CardFooter | standard div props                                                                                     | Stacks full-width actions below 640 px; aligns actions right on desktop, with an 8 px gap                                                                       |

`Input.className` styles the field wrapper. Icon slots accept decorative React nodes; do not place interactive controls inside an aria-hidden slot. Use `PasswordInput` for password visibility. Checkbox `indeterminate` is applied to the DOM property; in a controlled selection group, update it together with `checked` after each change.

Checkbox forwards `ref` to its native input, supporting both object refs and React 19 callback-ref cleanup. DatePicker and TimePicker expose their visible button through `triggerProps.ref`, with button events such as `onBlur`; their committed value and native form serialization contracts remain unchanged.

Cards placed on `color/surface/canvas` use at least `elevation/subtle` at every viewport size. `Card` provides it by default; custom card wrappers use `shadow-sui-elevation-subtle`. Keep stronger approved elevation where required, and avoid adding duplicate shadows to nested content.

## Form controls

| Component     | Main props                                                                         | Native behavior                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Textarea      | label; hideLabel; helperText; error; leftIcon; rightIcon; native rows/maxLength    | Multiline editing, vertical resizing, readonly/disabled and form submission; grows with content where field-sizing is supported |
| Select        | label; hideLabel; helperText; error; leftIcon; rightIcon; option/optgroup children; onValueChange; triggerProps | Figma selection popup with keyboard navigation; value/onChange or defaultValue; native form submission and reset |
| Radio         | label; hideLabel; name; value; checked/onChange or defaultChecked                  | Native exclusive selection and arrow keys when options share a name; group with fieldset/legend                                 |
| Switch        | label; hideLabel; checked/onChange or defaultChecked                               | Native checkbox with role=switch; Space toggles; checked/name/value control submission                                          |
| OTPInput      | label; hideLabel; helperText; error; value/onValueChange or defaultValue           | One text input with six decorative digit cells; one tab stop and one submitted value; paste, selection and deletion             |
| PasswordInput | Input props except type; showPasswordLabel; hidePasswordLabel                      | Visibility button changes type without changing value or submitting; native form reset remasks the value                        |

Field `className` props style the outer field; Radio and Switch `className` props style their label wrapper. Refs on these six components reach their native input, select or textarea. Labels remain programmatically available when `hideLabel` is true. Errors replace helper text and set `aria-invalid`; external `aria-describedby` references are preserved.

Select accepts native `option` and `optgroup` children, including fragments. Use unique string values; omitted option values default to their text. Both modes render **option items only**, without a heading, field label, search input or action footer inside the popup. Optgroup names remain available to assistive technology without visible headings. Disabled empty placeholder options stay in the field/native control and are omitted from the popup. The popup follows Figma's Dropdown Menu: 8 px padding, 12 px outer radius, floating elevation, 40 px minimum rows, 4 px row gaps and the approved Unread indicator. Long labels grow naturally. Its portal follows the trigger width, flips at viewport edges and scrolls when necessary.

- **Single selection** (default): `value`/`defaultValue` are strings. Choosing an option updates the field and closes the popup. Radix Select provides focus management, arrow/Home/End navigation, typeahead, Escape dismissal and focus restoration.
- **Multiple selection** (`multiple`): `value`/`defaultValue` are string arrays; the default is an empty selection. `placeholder` defaults to `Select options`. Each item has the shared 20 px Checkbox artwork on the right, unchecked until selected. Clicking an item or pressing Space/Enter toggles it without closing. Selected labels appear in option order, separated by commas, and wrap in the field. Clicking anywhere outside dismisses the popup and lets that click activate its target; clicking the trigger again also closes it.
- In multiple mode, arrows, Home/End and typeahead move focus without changing selection. Escape closes and returns focus to the trigger. Tab/Shift+Tab close and continue from the trigger's document position. Radix Popover manages the non-modal portal, placement and dismissal; the internal listbox navigation follows the [WAI-ARIA multiple-selection pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/). Options expose `aria-selected`; the checkbox artwork is decorative to avoid nested interactive controls.

`onChange` receives a real native select change event; `onValueChange` receives a string in single mode or a string array in multiple mode. Choose one callback to update controlled state. For multiple native events, read `event.currentTarget.selectedOptions`; `event.target.value` only returns the first selection. A visually hidden select preserves `name`, `form`, required validation, native change events, refs and FormData. Use `FormData.getAll(name)` for multiple selections; an empty selection submits no entries, and disabled options are omitted by native form submission. Required validation follows the native control's rules. Calling the native ref's `focus()` or encountering a required error transfers focus to the visible trigger. Use `triggerProps` for visible keyboard/pointer/focus handlers, styling and a button ref; other native event props remain attached to the form select. The field's `className` still styles its wrapper. Uncontrolled reset restores `defaultValue`; controlled reset belongs to the parent, and cancellation preserves the value without change callbacks. There is no readonly select state in native HTML. Search input, async option loading and virtualization are outside this API.

```tsx
const [teams, setTeams] = useState<string[]>([]);

<Select multiple label="Teams" name="teams" placeholder="Select teams"
  value={teams} onValueChange={setTeams}>
  <option value="operations">Operations</option>
  <option value="product">Product</option>
  <option value="support">Support</option>
</Select>
```

Radio uses the approved 20 × 20 SVG artwork. Switch uses a 40 × 24 track, a 16 px thumb and 4 px insets matching the inspected Figma nodes; separating these shapes allows continuous movement rather than swapping static images. Disabled colors remain token-driven, and keyboard focus is independent of selection. Forced-color mode exposes native controls. The caller controls group legends, contextual descriptions and validation.

OTPInput accepts up to six ASCII digits as a string. Non-digits are removed, preserving leading zeros. Pasting a complete six-digit code replaces the whole value; a shorter paste replaces the current selection. The control declares `inputMode="numeric"`, `autoComplete="one-time-code"`, a six-digit pattern and a six-character limit. Real SMS delivery and platform autofill remain application/device integrations. Entering six digits does not submit or verify anything. Use `required` when an empty value must block submission.

For controlled OTP usage, update `value` in `onValueChange` and reset that state in the form's `onReset`. Uncontrolled usage restores `defaultValue` on reset. A cancelled reset preserves the value. OTPInput owns its change normalization; use `onValueChange` rather than a native `onChange`. Keyboard selection and deletion operate on the single native value. Digit order remains left-to-right even in a right-to-left page.

PasswordInput keeps the visibility action outside decorative slots. Its button retains focus while toggling, is disabled with the field, and uses the approved eye icon. Customize `showPasswordLabel` and `hidePasswordLabel` for localization. Choose `autoComplete="current-password"` or `"new-password"` at the call site. Controlled password values follow the same parent-state reset contract as Input.

Focus/hover/press are browser states, not public `state` props. Only meaningful persistent states such as disabled, loading, invalid and checked are props. Avoid forcing a visual focus state without actual keyboard focus.

Source nodes: Button 145:7 / 145:152 / 145:297 / 145:442; Input board 149:2; Checkbox 165:60; Badge 166:75; Card 172:968. Cards are implemented as composable containers; dashboard editing and dialogs are separate future behaviors.

Phase 02 source nodes: Textarea 166:337; Select 166:486 and Dropdown Menu / Selection 171:176; Radio 165:176; Switch 165:267 (track/thumb 165:229 and 165:245); OTP Input 170:68; Password 148:416 and 148:514. Asset provenance is tracked in `src/assets/manifest.json`.

Select mode follow-up: Select set 166:485 now contains twelve single/multiple state variants; Dropdown Item set 171:150 includes the seven multiple-selection item states; Dropdown Menu set 171:201 includes empty (283:116) and selected (283:158) multiple compositions. Select usage board 175:3526 shows single, empty multiple and selected multiple cases. Checkbox artwork is reused from the existing approved library.

## Navigation and identity

| Component | Main props | Behavior |
| --- | --- | --- |
| Tag | leftIcon; rightIcon; onRemove; removeLabel; disabled | Passive label by default; an explicit, named removal button is optional. Disabled removal cannot activate. |
| Avatar | name; initials; size=24/30/32/40/48 | Initials are derived from the first/last words when omitted. Size 30 is reserved for the approved Records table. Set aria-hidden when adjacent text names the same identity. |
| Link | Native anchor props; disabled | A real anchor. Disabled removes href and tab access, exposes aria-disabled and blocks activation. |
| Tabs | Radix Root props, including value/onValueChange or defaultValue; activationMode; orientation | Compose TabsList, TabsTrigger and TabsContent. Give each list an accessible name and matching unique values. |
| Breadcrumb | items; compact; leadingAction | Ancestors are native links; the last item is the current page. Compact mode keeps the nearest ancestor and current page. |
| Pagination | page; totalItems; pageSize; onPageChange; disabled; localization callbacks | One-based, controlled pages. Invalid numbers are normalized, boundaries disabled and repeated current-page actions ignored. Parent owns fetching/slicing. |
| NavigationItem | label; href; icon; activeIcon; active; layout | Native route anchor. Supply Bold Duotone/Bold pairs. Compact labels remain accessible; aria-current is independent of keyboard focus. |
| Navbar | leading; search; actions; items; layout; navigationLabel | Desktop context/search/actions or mobile route items. Auto switches at 64 rem. Positioning belongs to the shell. |
| NavbarSearch | label; native input props | Named search input; parent form owns submission, results and shortcuts. |
| Sidebar | brand; compactBrand; toggle; workspace; account; items; footerItems; compact | Expanded/compact rail; caller owns toggle state and a reachable expand control. Items use stable id or href/label keys. |
| SidebarIdentity | name; initials; description; compact; expandable; native button props | Elevated workspace/account action. `expandable` displays the chevron; caller owns chooser behavior and aria-expanded. |
| Stepper | steps; currentStep; onStepChange; getStatusLabel | Zero-based active step, or steps.length for completion. Only completed steps become revisit buttons. Optional shortLabel is visual on narrow screens; the full label remains accessible. |

Tabs use the [Radix Tabs contract](https://www.radix-ui.com/primitives/docs/components/tabs). Arrows/Home/End move focus and skip disabled tabs. Automatic activation is appropriate for instantly available panels; use `activationMode="manual"` when loading is costly, then Enter/Space activates. Hidden panels follow Radix lifecycle behavior; applications that force-mount panels must supply their visibility policy.

Navigation icon slots are decorative; control names come from text. Preserve supplied SVG dimensions: navigation icons are 20 px, tag/tab slots 16 px, breadcrumb separators 12 px. The rail composes with Drawer for mobile navigation; the phase 04 workshop includes route activation and focus restoration. Mobile Navbar intentionally presents route links; the application places any mobile search or utility toolbar separately. Parent containers must provide room for the rail and manage overflow for long navigation lists.

Use `IconButton aria-label="Show notifications" icon={<NotificationIcon />}` for a single icon action. It composes Button, defaults to `variant="tertiary"` and `size="md"`, and requires an accessible action name. Primary, secondary, tertiary and danger share Button's native hover, pressed, focus and motion behavior. Square sizes are 32/40/44 px, with 16/20/24 px icon slots; use medium or large for touch controls. Loading disables activation, exposes `aria-busy` and preserves the action name. Supply a decorative icon that fits the slot and inherits the foreground color. `Button iconOnly` remains compatible with existing consumers; prefer IconButton for new work.

Secondary and tertiary IconButton glyphs use `color/icon/brand`, the primary system color, including hover, focus, pressed and loading states. Disabled controls retain `color/action/disabled/foreground`. This treatment is scoped to IconButton and does not recolor ordinary Button labels.

Figma: [Icon Button variants and examples](https://www.figma.com/design/2jnGtX6x5wYdoJDum40ovM/Serenity-UI---Design-System?node-id=333-910). Use `DropdownMenuTrigger asChild` to compose a menu trigger without nesting buttons. Pass a row-specific accessible name when an icon repeats in a table.

## Status and feedback

| Component | Main props | Behavior |
| --- | --- | --- |
| Alert | title; children; tone=info/success/warning/danger; announcement=off/polite/assertive | Inline message; static guidance is quiet by default. Opt into announcements only for newly arriving feedback. |
| Toast | title; description; action; dismissible; dismissLabel; open/onOpenChange or defaultOpen; duration | Success/completed-action notification. `action` requires label, descriptive altText and onClick. Actions persist by default; compact feedback follows provider duration. |
| ToastProvider / ToastViewport | Radix provider/viewport props; viewport `inline`, `position: "top-right" \| "bottom-right"` | One notification region per provider/viewport. Floating position defaults to bottom-right; inline previews ignore position. F8 enters the region, Tab reaches the notification then its buttons; Escape dismisses. |
| Progress | label; value; max; error; valueLabel; workingLabel | Values are clamped to 0..max. Omitted/non-finite value is indeterminate and omits aria-valuenow. `error` changes tone; provide explanatory label/text. |
| Skeleton | shape=row/metric/card; loadingLabel; description | Decorative placeholders are hidden from assistive technology; the containing result region owns aria-busy and completion announcements. |
| EmptyState | title; description; action; icon; illustration; variant; headingLevel | Contextual explanation and recovery action. Default card presentation is preserved; subtle shares the host surface. Parent owns wording and recovery. |

Toasts use the [Radix Toast contract](https://www.radix-ui.com/primitives/docs/components/toast). The default background announcement is polite and does not steal focus. Compact messages inherit the provider's 5-second default; hover, focus and window blur pause the timer. An action defaults to `duration={Infinity}` to preserve its opportunity. Callers may override duration explicitly. Use a persistent inline Alert for validation errors instead of the success-icon Toast. Toast is a presentation/behavior primitive; queueing, deduplication and application history are caller responsibilities. State, callbacks and React props stay local to the owning application.

Progress's className styles its outer layout; other native div/ARIA props target its progressbar track. External aria-labelledby and aria-label overrides are preserved. Data proportions are not snapped to the spacing grid or animated. Skeleton uses only decorative opacity motion; it never represents actual loading progress.

Selected Solar assets are provenance-tracked in `src/assets/manifest.json`; the full icon catalog is not exported as an API.

## Interaction motion

The [Serenity motion system](./MOTION.md) defines the current rhythms, curves, component coverage and implementation rules.

Phase 04 also applies the shared motion contract to overlays and pickers through `src/overlays-pickers.css`. Floating content uses the shared 240/120 ms opacity/4 px motion; side panels use 16 px horizontal travel. Semantic selection, calendar geometry and focus update immediately. Decorative selection artwork may settle. Reduced motion applies inside portals as well as the document flow.

`src/motion.css` is the shared policy for every implemented component family and future interactive components. It reuses the framework-independent Figma motion tokens without changing generated token files.

Charts use the [value reveal contract](#graphic-entrance-motion): visual values rise from zero while their scaffolding and semantic data remain available. Reduced motion presents final values immediately.

- Paint changes use `fast` (120 ms) and standard easing: buttons, fields, checkbox/radio artwork, Switch track, OTP cell selection, password actions, Badge tone and Card elevation. Passive surfaces only transition when their props/styles change; they gain no implied interactivity.
- Switch thumb travel and Select indicator rotation use `standard` (240 ms). CSS transitions can reverse from their current position without timers or delayed state updates.
- Select enters with opacity and a 4 px translation over 800 ms, and exits over 120 ms. Enter/exit easing and popup placement determine the direction. The behavior primitive retains the exiting element until its animation completes.
- Phase 03 extends paint transitions to tags, links, tabs, navigation, identity actions, steps and alerts. Toast reuses the 240/120 ms opacity/4 px entry/exit; swipe movement follows the behavior primitive.
- Skeleton opacity and indeterminate Progress translation use a decorative cycle of five `slow` durations (2 seconds). They stop under reduced motion; determinate progress changes immediately.
- Focus outlines, validation messages, values and accessibility states update immediately. Animate only explicit paint properties, opacity and transforms; never use `transition: all`, delayed form events or animated layout dimensions.
- `prefers-reduced-motion: reduce` sets interaction durations to zero, removes popup animation and disables the existing loading spinner animation. This includes portaled content and live OS preference changes.

DropdownMenu is the action-menu API. Select uses listbox semantics for choosing form values and retains its items-only single/multiple selection contract.

`DropdownMenuItem` and `TabsTrigger` support `asChild` with one element that forwards props and its ref. The element remains the focus/event target; leading/trailing icons and the text wrapper render inside it. For custom menu links, pass an anchor or router link that preserves native navigation. Use a button for custom tabs so Enter/Space and disabled behavior remain native. Consumer event handlers are preserved; `preventDefault()` can cancel the primitive action. Do not pass fragments or multiple sibling controls as the child.

## Overlays, calendar and pickers

| Component | Main props | Contract |
| --- | --- | --- |
| Dialog / DialogTrigger / DialogClose | Radix Root/Trigger/Close props | Controlled or uncontrolled opening. Use `asChild` for an existing Button trigger. |
| DialogContent | title; description; icon; footer; variant=standard/featured; showClose; closeLabel; Radix Content props | Named modal, safe viewport bounds, growing content and focus containment. Use `onOpenAutoFocus` to focus the safe action in a destructive confirmation. |
| Drawer / DrawerTrigger / DrawerClose | Radix Dialog props | Side-panel composition with the same focus/dismissal contract. |
| DrawerContent | title; description; footer; brand; closeIcon; side=left/right; size=content/navigation; closeLabel | Internal scrolling, persistent heading/close action and full-width mobile presentation. Compose Sidebar or application forms inside it. |
| TooltipProvider / Tooltip | Provider delay props; content:string; side; Root props; one trigger child | Supplementary, noninteractive text on hover/focus. Keep essential information visible; use Popover for buttons and links. |
| Popover / PopoverTrigger / PopoverClose / PopoverContent | Radix props; content sideOffset=8; collisionPadding=16 | Interactive contextual surface. Supply `aria-label` or `aria-labelledby` to name its dialog. |
| DropdownMenu / DropdownMenuTrigger / DropdownMenuContent | Radix props; sideOffset=8; collisionPadding=16 | Items-only action menu. Arrows/Home/End/typeahead move focus; Enter/Space activates; Escape restores the trigger. |
| DropdownMenuItem | onSelect; disabled; danger; leftIcon; rightIcon; Radix Item props | Action callback, decorative icon slots and explicit destructive tone. Use Select for form selections. |
| DatePicker | Field props; name; form; value/defaultValue; onValueChange; mode=single/range; min/max; isDateUnavailable; defaultMonth; locale; readOnly; applyLabel; clearLabel | Single values are ISO strings; ranges are `{start,end}`. Panel selection is provisional until Apply. Empty single value is `""`; empty range has two empty strings. |
| DateCalendar | value or range; mode; onSelect; min/max; isDateUnavailable; defaultMonth; today; locale; autoFocus | Supporting Monday-first Gregorian grid. Navigation changes focus; clicking/Enter/Space selects. The owner controls selection. |
| TimePicker | Field props; name; form; value/defaultValue; onValueChange; format=12h/24h; allowFormatSwitch; onFormatChange; minuteStep; min/max; readOnly; applyLabel; cancelLabel | Values always use `HH:mm`, including midnight `00:00` and noon `12:00`. Minute steps: 1, 5, 10, 15, 20 or 30. Defaults to 24-hour presentation and a 1-minute interval. Select hours, then minutes on the circular clock. |
| Calendar | startDate; events; onEventClick; today; locale; startHour=9; endHour=16; label | Five consecutive days starting at startDate. Events have unique id, ISO date, HH:mm start/end, title, optional type=meeting/note, tone=default/success and initials. |

```tsx
<DatePicker label="Review date" name="reviewDate" required
  value={date} onValueChange={setDate} min="2026-10-12" />
<DatePicker label="Reporting period" name="period" mode="range"
  value={period} onValueChange={setPeriod} />
<TimePicker label="Meeting start" name="start" defaultValue="09:30"
  format="12h" minuteStep={15} min="08:00" max="18:00" />
```

DatePicker submits a single ISO date under `name`. Range fields submit `${name}.start` and `${name}.end`. TimePicker submits `HH:mm`. Required validation blocks empty values; invalid ranges/times use native custom validity and focus the visible control with an associated error. Readonly values remain submitted; disabled fields are excluded. External forms work through `form`. Reset restores uncontrolled defaults, does not emit a user change, and honors `preventDefault`; controlled owners reset their own state in `onReset`.

Apply commits the draft. Date Clear changes only the draft, so Apply is still required. Escape or outside dismissal discards provisional changes; TimePicker also offers Cancel. Min/max are inclusive ISO-date or same-day HH:mm bounds. Ranges cannot span an unavailable interior date. Invalid time limits/intervals throw a configuration error. Keep `isDateUnavailable` synchronous and inexpensive; it checks every date in a selected range. Selection is panel-based; free-form parsing, timezone conversion and cross-midnight time bounds belong to a future extension.

Date-grid arrows move by day/week, Home/End by week boundary, PageUp/PageDown by month and Shift+PageUp/PageDown by year. Unavailable days remain discoverable but cannot be selected. The clock is a named slider: arrows adjust available values, Home/End reach the available bounds and Enter/Space advances from hours to minutes. Pointer/touch selection advances after releasing the hour hand; dragging previews values. The minute hand follows the configured interval, including values between the five-minute labels. Popups become modal sheets at widths of 400 px or less, or heights of 600 px or less. The picker restores its trigger after dismissal, including when nested in Drawer.

Calendar events are same-day entries with increasing start/end. Malformed entries and entries outside the five displayed days are excluded. Invalid startDate/hour configuration throws. The grid uses proportional time positioning; it is not an editable scheduling engine. Growing content that would overlap or exceed the grid, and events outside the visible hour range, trigger a complete agenda. Narrow screens always use the agenda. The caller supplies week navigation, fetching, editing and event-detail behavior; callbacks do not send or persist data.

Use `CardFooter` for overlay actions. Place the primary action first in JSX: mobile stacks actions at full width in reading and keyboard order, while desktop places the primary button at the right. Secondary actions follow below on mobile; the gap remains 8 px. Navigation, icon-only toolbars and segmented controls keep their own layout. If a controlled dialog opens without DialogTrigger (for example, Calendar events), retain the actual invoking element and restore it in `onCloseAutoFocus`. Preview implementations demonstrate this pattern. Provider/Root/content props follow the pinned Radix contracts; consumers that force-mount hidden content own its visibility and focus policy.

### Choosing a DatePicker variant

| Need | Variant | Value | Form entries |
| --- | --- | --- | --- |
| A due date, appointment or review | `mode="single"` (default) | `"2026-10-16"` | `date=2026-10-16` |
| A reporting window, booking or date filter | `mode="range"` | `{start:"2026-10-12", end:"2026-10-16"}` | `period.start=2026-10-12`, `period.end=2026-10-16` |
| An optional empty date | Single with `defaultValue=""` | Empty string | Empty date entry |
| An optional empty period | Range with `{start:"",end:""}` | Two empty strings | Two empty entries |
| A bounded or restricted selection | Either mode with `min`, `max`, `isDateUnavailable` | Same contract as the chosen mode | Same names; validation blocks unavailable selections |

```tsx
// A single deadline, owned by the surrounding form.
const [deadline, setDeadline] = useState("2026-10-16");
<DatePicker label="Deadline" name="date" mode="single"
  value={deadline} onValueChange={setDeadline} required />;

// An inclusive reporting period. A partial range cannot be applied.
const [period, setPeriod] = useState<DateRange>({ start: "", end: "" });
<DatePicker label="Reporting period" name="period" mode="range"
  value={period} onValueChange={setPeriod} required
  min="2026-01-01" max="2026-12-31" />;

// A readonly value remains submitted; disabled values do not.
<DatePicker label="Approved period" name="approved" mode="range"
  defaultValue={{ start: "2026-10-12", end: "2026-10-16" }} readOnly />;
```

`mode="single"` selects one individual date. It does not mean an arbitrary set of nonconsecutive dates; that API is not implemented. Range selection is inclusive and may start/end on the same day. Clicking earlier than the unfinished start restarts the range. Both modes share label, guidance, error, disabled, readonly, required and keyboard behavior. The workshop shows their field and calendar specimens together, followed by a working form example.

Selected single dates and range endpoints use Button's primary hover/pressed backgrounds and foreground. Interior range days use secondary interaction colors. Disabled days do not gain an interactive hover treatment.

### Circular TimePicker

The clock starts with hours on each opening. Selecting an hour by pointer/touch advances to minutes; keyboard users press Enter/Space to advance after adjusting. The digital hour and minute buttons revisit either step. In 24-hour mode, the outer ring is 1–12 and the inner ring is 00, 13–23. In 12-hour mode, AM/PM determines the half-day. The dial's hand responds immediately to input; format/step buttons use shared paint transitions and reduced motion.

The visible 12 h / 24 h switch changes presentation without changing the time value. The `format` prop establishes the preferred format and resynchronizes it when the prop changes. `onFormatChange` observes user format changes; `allowFormatSwitch={false}` locks presentation. A user format choice persists for the mounted field, including after Cancel; Cancel discards the time draft. Values and form submissions always use 24-hour `HH:mm`.

The default minute interval changed from 15 to **1** on 2026-10-16. Set `minuteStep={15}` explicitly for quarter-hour schedules. The dial shows five-minute labels but pointer angles and keyboard increments support every configured minute. Unavailable hours/minutes cannot be selected; keyboard movement skips them. A canceled pointer gesture restores the draft at the beginning of that gesture. Apply remains explicit; choosing a minute never submits or closes the picker automatically.

## Tables

An empty DataTable displays a subtle folder illustration, "No records" and explanatory copy. Override `emptyState` for filtered results, with `<EmptyState variant="subtle" illustration="search" ... />` and a clear-search action. Loading and error take precedence over empty content.

`Table.emptyContent` lives below the horizontally scrollable native table, inside the same bordered surface, and is associated with it through `aria-describedby`. This keeps recovery text and actions visible at mobile widths while preserving column geometry. Do not insert an additional empty row when using this slot.

`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead` and `TableCell` compose native table elements. `Table` requires a descriptive `label`, renders a caption and adds a focusable horizontal scroll region. Arrow keys can scroll that region; native Tab reaches each control. Cells support optional decorative `leftIcon`/`rightIcon` slots. Row `selected` changes its surface; selection semantics belong to the Checkbox, not a simulated grid role.

`DataTable<T>` composes these primitives with controlled behavior:

| Prop | Contract |
| --- | --- |
| `label`, `columns`, `rows`, `getRowId`, `getRowLabel` | Required. Columns have unique IDs, header text and a `cell(row)` renderer. Row IDs must be nonempty and unique within the visible page; use stable global IDs across pages. |
| Column `width`, `minWidth`, `leftIcon`, `rightIcon` | Optional geometry and decorative slots. Supply enough minimum width for the content; overflow stays inside the table viewport. |
| `rowActions`, `actionsLabel` | Optional trailing action column, separate from every data column. Render tertiary IconButton controls in `rowActions(row)`; the localized heading defaults to "Actions" and is visually hidden. Controls align to the end with an 8 px gap. Loading/error spans include this column. |
| `sort`, `onSortChange` | Column ID and ascending/descending direction. Mark a column `sortable` to show its button. The owner sorts the complete filtered data before paging, or requests a sorted server page. The table does not reorder rows itself. |
| `selection` | `selectedIds`, `onSelectedIdsChange`, optional `isRowSelectable`. The header selects/clears eligible rows on the visible page and preserves off-page IDs. Mixed state reflects eligible page rows only. Prune deleted IDs in the data owner. |
| `pagination` | `page`, `pageSize`, `totalItems`, `onPageChange`, plus optional Pagination copy callbacks. Supply the already sliced page in `rows`. Reset/clamp page when filters or the dataset change. |
| `loading`, `loadingLabel`, `error`, `emptyState` | Loading takes precedence and replaces rows with Skeleton, exposes `aria-busy` and announces the loading label. Error replaces rows with an alert. Both disable selection/sorting/paging. Empty content defaults to EmptyState; supply a recovery action for filtered results. |
| `getSortLabel`, selection `selectPageLabel` / `getSelectionLabel` | Localizable accessible names. Default names are English. |

```tsx
const columns: DataTableColumn<RecordItem>[] = [
  { id: "name", header: "Record name", minWidth: 180,
    sortable: true, cell: row => row.name },
  { id: "owner", header: "Owner", width: 204,
    minWidth: 204, cell: row => row.owner },
];

// The owner computes visibleRows after filtering and sorting, or fetches them remotely.
<DataTable label="Workspace records" rows={visibleRows} columns={columns}
  getRowId={row => row.id} getRowLabel={row => row.name}
  sort={sort} onSortChange={next => { setSort(next); setPage(1); }}
  selection={{ selectedIds, onSelectedIdsChange: setSelectedIds }}
  pagination={{ page, pageSize, totalItems, onPageChange: setPage }} />;
```

The approved Records composition preserves the Figma table exceptions: 3 px name/status spacing, 10 px owner gap, 30 px avatar and 5 px badge radius. `Avatar` accepts `size={30}` for this composition; `Checkbox size={16}` uses its original 16 px Solar Unread export, with a separate 20 px default for ordinary controls. Existing table typography stays unchanged. Content grows rather than clipping. The workshop includes a faithful seven-record specimen, followed by a functional searchable/paged example with menus and record details. Preview mutations stay local.

Priority contains only its value. The final action column uses a 40 px tertiary IconButton and a blank visible header, matching the revised Figma row. Its 72 px minimum includes the outer 16 px table padding. The hidden header is positioned inside the cell to prevent document overflow on mobile. Keep action menus out of the `columns` data renderers; provide them through `rowActions`.

Row virtualization, inline cell editing, column resizing/reordering and backend fetching are not included. Native form reset does not reset DataTable's controlled selection: reset it in the owner.

## Empty-state illustrations

`EmptyStateIllustration` takes a required `name` and optional `className`. Available names: `error`, `search`, `wallet`, `card-error`, `files`, `chat`, `products`, `purchases`, `content`, `saved`, `connection`, `payment-success`, `payment-error`. These are decorative SVG exports from the owner's Foundations artwork, with a 160 × 144 intrinsic canvas. Preserve their aspect ratio and provide meaning in visible text.

`EmptyState.illustration` uses this catalog instead of the small `icon` slot. The default `variant="card"` keeps the previous card API; `variant="subtle"` uses no independent border, background or shadow, with 24 px padding, 8 px gaps and a 16/24 heading. Footer actions remain right-aligned. Description may be null for a labeled catalog specimen. Illustrations use the shared 800 ms entrance and render immediately with reduced motion.

The SVG palette is exported from semantic Figma variables. It is a light-theme asset snapshot, not runtime theme substitution; re-export when those design colors change. Provenance is recorded in `src/assets/manifest.json`, with master, artwork and review instance IDs in `docs/figma-empty-states.json`.

## Graphic entrance motion

Chart and chart widgets keep their containers, axes and titles visible while visual marks and counters animate from zero to the final value. This takes two `motion/duration/slow` durations (1,600 ms) with enter easing. Final scales and normalization totals are fixed, so percentage charts also grow correctly from zero. The semantic data table always contains final values. `animated={false}` opts out; changing `animationKey` replays without remounting. Ordinary data updates apply immediately.

Progress and empty-state illustrations retain `sui-chart-appear`: a 800 ms opacity/8 px wrapper reveal. Charts no longer use that wrapper animation.

## Charts and widgets

`Chart` uses a discriminated TypeScript contract: the required `type` determines its data shape. All variants require a descriptive `label`. `ChartDatum` is `{ id, label, value }`; `ChartMatrixRow` is `{ id, label, values }`; `ChartPoint` is `{ id, label, x, y }`. IDs must be nonempty and unique within each chart. Values must be finite and nonnegative.

| Type | Data and behavior |
| --- | --- |
| `metric` | `value`, `data: ChartDatum[]` for the sparkline, optional `comparison` and `comparisonTone` (neutral/success/danger). An empty sparkline does not hide the headline value. |
| `line`, `area` | `data: ChartDatum[]`; categories retain the supplied order and equal spacing. A single datum remains visible as a point. These are categorical timelines, not continuous date scales. |
| `column`, `histogram` | `data: ChartDatum[]`; optional positive `max`. Histogram takes already aggregated, equally sized numeric bins; it does not bin raw observations. |
| `horizontal-bar`, `funnel` | `data: ChartDatum[]`, optional `max` and `note`. Funnel stages must be non-increasing. The caller supplies any conversion statement in the note. |
| `stacked-bar` | `series: string[]` (1–6 unique names), `data: ChartMatrixRow[]`. Every row matches the series count. Segments normalize to 100%; zero-total rows retain an empty track. The data alternative preserves original counts. |
| `donut` | Up to six `ChartDatum` parts and optional `unit`. Total is calculated from values; an all-zero series retains an empty ring and zero-valued legend. |
| `goal` | `value`, positive `max`, optional `target` and `summary`. Value and target must be within the scale. |
| `heatmap` | Unique named `columns`, matching `ChartMatrixRow[]`, optional `max` and `note`. Three semantic intensity bands and visible values prevent color-only reading. |
| `scatter` | `ChartPoint[]`, required `xLabel`/`yLabel`, optional `xMax`/`yMax`. Both axes start at zero. |

Omitted maxima derive from the data, with a safe 0–1 domain for all-zero values. Explicit maxima must include every value; invalid scales, negative/nonfinite values, malformed matrices and overflowing totals throw RangeError. Negative axes, multiple overlaid series, logarithmic scales, zoom, crosshairs and raw-observation binning are outside this block.

The SVG paths and HTML marks are generated from props; they are not screenshots or static exports of sample data. Colors and typography use semantic tokens, including `color/data/area`. Bar tracks use the 4 px radius and clip segmented edges. Horizontal bars and funnel stages share a label column with an 8 px gap before a common bar origin. Long labels wrap within a column capped at 32% of the plot container; funnel values occupy a separate shared trailing column. Marks resize with their container; labels stay at their token font size. For dense datasets, aggregate categories and provide short labels. Use `formatValue` for units or compact large numbers; default formatting is English with up to two decimal places.

Each figure has an always-available native data table for assistive technology. `showDataTable` makes it visible and horizontally keyboard-scrollable. The visually hidden alternative has no focusable scroll wrapper. `description`, `dataTableLabel`, `categoryLabel` and `valueLabel` provide context and column names. Empty arrays render a subtle empty state with customizable `emptyLabel`/`emptyDescription`; actual zero values are data and remain visible. Tiny stacked segments retain accurate width but omit their visual percentage when it cannot fit; their values remain in the data table.

`Widget` composes Card, Chart and Skeleton. Required props are `title` and `chart: ChartProps`. Optional `description`, `actions`, `footer` and `headingLevel` configure the composition. Loading takes precedence over error and data; error displays an alert and optional right-aligned `recovery`. The owner handles fetching, errors and retry. Compose DropdownMenu in `actions` to expose the data table. `KPIWidget` is the compact headline composition with `title`, formatted `value` and optional `comparison`.

```tsx
const chart: ChartProps = {
  type: "line",
  label: "Created records",
  max: 240,
  data: monthlyRecords,
  showDataTable: showData,
};

<Widget
  title="Created records"
  description="Records · Apr–Sep 2026"
  chart={chart}
  loading={loading}
  error={error}
  recovery={<Button onClick={retry}>Retry</Button>}
/>;
```

The workshop includes all 12 chart specimens, all 13 approved widget compositions, reporting-period/chart-type controls, a data disclosure menu and loading/error/empty recovery. Dashboard composition and editing are documented below.

Use one value clock for each plot, not a cascade of delayed marks. Keep the plot mounted when updating values so sorting, filtering and unrelated renders do not replay it. Decorative marks may change width/height within the fixed plot bounds; controls, axes and card layout do not animate. Counters interpolate visually without live announcements or source-data changes. Lazy-mounted plots reveal on mount; `animationKey` permits explicit replay. Under `prefers-reduced-motion: reduce` or `animated={false}`, show the final state immediately.

## Dashboard composition and zone editor

`Dashboard` renders a controlled layout in Summary and Analysis zones. Hidden entries remain in the layout but are not rendered. Its `children` slot follows both zones and is intended for fixed content such as the existing Records table. `DashboardEditor` edits the same model. Pass `renderWidget` to arrange the actual widgets in the dashboard grid; hidden widgets remain available through the consumer's catalog. Omitting this prop retains the compact Summary / Analysis / Hidden management view. Neither mode fetches business data or writes browser storage.

| Contract | Behavior |
| --- | --- |
| `widgets: DashboardWidgetDefinition[]` | Stable unique `id`, visible `title`, `kind`, visible `defaultZone`, `defaultSize` and allowed `sizes`. Supply definitions only for widgets the current user may access. |
| `value: DashboardLayout` | Ordered `{ id, zone, size }` entries. Every registered widget must occur exactly once. Zones are `summary`, `analysis`, `hidden`; sizes are `S`, `M`, `L`. Array order determines reading order within each zone. Invalid controlled configurations throw. |
| `Dashboard.renderWidget(widget, item)` | Render an existing Widget/KPIWidget or another composition. Data fetching and visualization state remain with the consumer. |
| `DashboardEditor.renderWidget(widget, item)` | Optional live composition mode. Use the same renderer as Dashboard so edit mode keeps real metrics and charts visible. The existing card receives a drag toolbar, size settings and a keyboard action menu. |
| `DashboardEditor.onChange(next)` | Receives a draft after movement or size changes. The consumer chooses when to apply, save or discard it. |
| `moveDashboardItem(value, id, zone, beforeId?)` | Immutable movement before an item in the destination zone, or at the end of the zone. Unaffected items retain their relative order. |
| `serializeDashboardLayout(value)` | Version 1 JSON containing IDs, zones and sizes only. Never includes chart values, profile identities or business data. |
| `restoreDashboardLayout(json, widgets, defaults)` | Validate defaults, reject malformed/unsupported versions, remove retired or duplicate IDs, repair invalid entries from defaults and append newly available widgets. |

```tsx
const [saved, setSaved] = useState<DashboardItem[]>(initialLayout);
const [draft, setDraft] = useState<DashboardItem[] | null>(null);

// Enter edit mode with a copy; only Save replaces the committed layout.
<Button onClick={() => setDraft(saved.map(item => ({ ...item })))}>
  Customize dashboard
</Button>;

{draft ? (
  <DashboardEditor widgets={widgets} value={draft} onChange={setDraft}
    renderWidget={renderWidget} />
) : (
  <Dashboard widgets={widgets} value={saved} renderWidget={renderWidget} />
)}

{draft && <CardFooter>
  <Button onClick={() => { setSaved(draft); setDraft(null); }}>Save layout</Button>
  <Button variant="secondary" onClick={() => setDraft(null)}>Cancel</Button>
</CardFooter>}
```

The editor provides pointer handles with an 8 px activation threshold, zone/insertion feedback, pointer cancellation and Escape cancellation. In live mode, the actual card follows the pointer using a transform while its original grid slot remains reserved. The single mounted widget preserves data, IDs and chart entrance state; no visual clone is created. Only dropping inside a valid zone changes the draft. Dropping outside the editor or cancelling restores the card. Edge scrolling continues while the pointer is held near the document viewport edge. Touch scrolling remains native outside the handle.

The live card's Widget actions menu exposes Move earlier/later, zone transfer and Hide widget. The compact view retains Move up/down, Move to… and Show. These provide equivalent explicit controls for keyboard, touch and assistive technology. Movement announcements identify the destination and position, and focus follows the moved card; hiding a live card moves focus to the editor. Settings opens the existing Dialog with native Radio controls; Cancel discards its size draft and Apply size updates the editor draft. Hidden widgets retain their size; the catalog's Show action restores their recommended zone.

Grid thresholds use available container width rather than viewport width. Below 672 px all widget sizes occupy one column; from 672 px, S occupies one of two columns and M/L span both; from 1008 px, S/M/L span one/two/three columns. Live editing uses the same grid and size spans as the dashboard. The optional compact management view uses one column, two from 688 px, and three from 1008 px. Text and card height remain content-driven. No CSS dense packing or layout animation changes reading order. Existing chart entrances and reduced-motion behavior remain intact; pointer-following transforms directly track the user's gesture without decorative motion or easing lag.

The workshop exposes three headline metrics and all twelve chart types in its catalog. Save commits to a versioned local-storage key scoped to a demo workspace/profile; Cancel does not write. Leadership and Operations demonstrate independent preferences, not authenticated users. If storage is unavailable, the current layout still applies in memory and a visible status explains that it will not survive reload. Changing profiles requires saving or cancelling the draft first. The Records example stays mounted during customization, preserving filters and selection.

Production integration must supply authenticated identity, server persistence/error handling and authorization-filtered definitions. Browser storage is not an authorization boundary. Cloud synchronization, concurrent editing/conflict resolution, custom zones, freeform pixel resizing and a task Kanban board are outside this block. Pointer autoscrolling currently follows the document viewport; embedded scrolling panels should use the explicit move controls or provide their own integration.

## Authentication compositions

`AuthLayout` provides the approved centered card, existing Serenity logo, raised elevation and frosted background. `SignInForm` composes Input, PasswordInput, Checkbox, Link, Button and Alert. Authentication is an application integration, not an implicit network request made by the kit.

| Component / property | Contract |
| --- | --- |
| `AuthLayout.title`, `description`, `children`, `footer` | Accessible heading, optional supporting copy, form content and optional footer. The card grows with content. |
| `AuthLayout.headingLevel` | 1 by default; choose 2 or 3 when embedding in an existing page hierarchy. |
| `AuthLayout.brand` | Optional accessible product logo. The default preserves the original login artwork and intrinsic dimensions. |
| `AuthLayout.animated` | True by default. False renders a static leaf. OS reduced motion always wins. A visible pause/resume control accompanies the loop. |
| `SignInForm.onSignIn(values, { signal })` | Required sync/async integration callback. Values contain email, password and rememberMe. Resolve after the application handles the response, or reject for generic retry feedback. Pass the signal to the request; unmount aborts it. |
| `SignInForm.forgotPasswordHref`, `onForgotPassword` | Required real recovery destination and optional router click handler. The link is unavailable while submission is pending. |
| `SignInForm.defaultEmail`, `defaultRememberMe` | Initial native field values; empty email and checked remember preference by default. Resetting defaults requires remounting the form. No password default is accepted. |
| `SignInForm.error` | Optional safe application-owned error copy. Clear it in the application when appropriate. Raw server exceptions should not become user-facing text. |
| `PasswordInput.visibilityIcon` | Optional decorative artwork for the existing visibility button. Its show/hide accessible labels and keyboard behavior remain unchanged. |

```tsx
<AuthLayout
  title="Welcome back"
  description="Sign in to your workspace."
  footer="Need access? Contact your administrator."
>
  <SignInForm
    forgotPasswordHref="/forgot-password"
    onSignIn={async (values, { signal }) => {
      await auth.signIn(values, { signal });
      navigate("/dashboard");
    }}
  />
</AuthLayout>
```

`auth` and `navigate` in this example are application integrations, not kit exports. The application owns provider error handling, second-factor challenges, sessions, authorization and routing. A resolved callback does not itself imply that the user is authenticated. Remember me is a preference passed to the provider; the component never stores a password, token or session.

The form uses native email semantics and password-manager hints (`username`, `current-password`). On submit it trims email, validates email format and a nonempty password, and focuses the first invalid field. It never trims passwords or applies a registration password policy to an existing account. Associated error text and an assertive generic request error make failures discoverable. Pending requests are guarded against duplicate submission; editable values become readonly, the submit action exposes loading and a polite status announces progress. Failed requests preserve field values for retry. Rejections do not expose raw backend details. The form deliberately uses custom validation with `noValidate`; required semantics are exposed with `aria-required` without adding unapproved label markers.

The card is at most 448 px wide, uses 16 px padding on small containers and 32 px from 640 px, and allows narrow layouts and enlarged text to reflow. AuthLayout has a 940 px preview minimum height; consumers may override it through className (the standalone workshop uses 100svh). The composition reserves clearance for the pause control on short screens. Brand geometry and exported leaf bounds are asset exceptions to the 4 px metric scale; form spacing follows tokens.

The original 14.02-second Figma timeline draws and erases the leaf from its lower tip and coordinates two fill paints with a glow. Source SVG paths and filters are preserved, inlined solely for path-level motion, with fragment IDs scoped per instance. Only reviewed bundled SVG strings enter the internal markup adapter. Background movement never animates card layout or field state. CSS keyframes preserve the exported timing/easing; no animation dependency was added. A pause control freezes the timeline, offscreen instances pause, and reduced motion removes animation while showing the complete static leaf. These decorative path/paint/glow tracks are an explicit exception to the interaction-only transform/opacity policy. Inspect [motion evidence and the background-blur discrepancy](./figma-auth-motion.json) before updating this timeline.

The workshop at `#signinform` exposes all six screens, successful/rejected responses, a sign-in response that requires verification, and valid/expired/invalid reset links. `?preview=signin` opens the standalone composition; append `&step=forgot-password`, `check-inbox`, `reset-password`, `password-updated` or `verify` for a direct specimen. Ordinary links change the in-memory demo step; opening a link in another tab uses its real destination. The preview does not send, log or persist credentials. An explicitly marked action outside the inbox card simulates opening an email link. Registration is outside the agreed scope.

### Recovery and verification

`AuthScreen` accepts a discriminated `screen` object with a `step` and that step's integration props. It supplies the approved heading, copy, form, footer and original success shield. Keep one AuthScreen mounted as steps change: AuthLayout preserves the leaf DOM, timeline and pause state while forms unmount and clear their fields. By default, changed headings receive focus; set `focusHeadingOnChange={false}` when the application router manages focus. AuthLayout exposes the same option (false by default) and an optional decorative `headingIcon` for custom compositions.

| Step / standalone component | Contract |
| --- | --- |
| `forgot-password` / `PasswordRecoveryForm` | `onRequestReset(email, { signal })` receives a trimmed, validated address. `defaultEmail` initializes the field. The application advances after handling the response. |
| `check-inbox` / `RecoveryEmailSent` | `email` identifies the destination in AuthScreen's account-neutral copy. `onResend({ signal })` repeats the request; `changeEmailHref` and optional `onChangeEmail` navigate to another address. |
| `reset-password` / `ResetPasswordForm` | `onResetPassword(password, { signal })` receives the unchanged password after policy and confirmation validation. `requestResetHref` and optional `onRequestNewLink` recover from invalid links. |
| `password-updated` | AuthScreen supplies the original 64 px shield and a native Back to sign in action. Render only after the application confirms success. |
| `verify` / `TwoStepVerificationForm` | `onVerify(code, { signal })` receives exactly six ASCII digits as a string, preserving leading zeros. Pasting/completing the code never submits automatically. The application owns the authenticator challenge; no email/SMS resend action is presented. |

Every recovery/verification step requires `signInHref` and accepts optional `onBackToSignIn` for router interception. Forms and resend expose safe application-owned `error` copy, single-flight pending state, generic rejection feedback and an AbortSignal that is cancelled on unmount. Applications must pass the signal through to their service and avoid late navigation after cancellation. Clear supplied errors in the application when appropriate. Native action links retain link semantics, 44 px minimum height and shared hover/pressed/focus motion.

`RecoveryEmailSent.resendCooldownSeconds` defaults to 30. The countdown starts on mount and restarts only after a successful resend; failures allow immediate retry. A changed email remounts the destination-specific content, cancels its pending request and starts a fresh cooldown. The deadline uses wall time and synchronizes when the document becomes visible. Successful resends announce once; countdown ticks are not live announcements. This UI delay does not replace server throttling.

`ResetPasswordForm.tokenStatus` is `valid` (default), `expired` or `invalid`. The default is a rendering state, not token validation: the application must validate the reset link before rendering the active form and enforce validity again on submission. Invalid/expired states remove password fields and provide a new-link action; status changes abort pending requests. `minimumLength` defaults to the approved 12-character copy and counts Unicode code points without trimming. Optional `validatePassword(password)` returns additional safe policy feedback. Match these settings to the application's server policy; the component does not check password history or reset tokens. Remount the form when switching to a different reset token, or TwoStepVerificationForm when switching to a different challenge, to clear prior fields and pending work.

```tsx
<AuthScreen screen={{
  step: "reset-password",
  tokenStatus: validatedLinkStatus,
  signInHref: "/sign-in",
  requestResetHref: "/forgot-password",
  onResetPassword: async (password, { signal }) => {
    await auth.resetPassword(resetToken, password, { signal });
    if (!signal.aborted) setStep("password-updated");
  },
}} />
```

The service, validated link status, token and step setter above belong to the consuming application. Kit components never read URL tokens, create sessions, send email or authorize access. [Recovery design and motion evidence](./figma-auth-recovery.json) records all ten inspected desktop/mobile Figma frames.
## ScrollArea and responsive foundations

`ScrollArea`, `ScrollAreaViewport` and `ScrollBar` form a compound scroll container. The root accepts Radix root props, including `asChild`, `dir`, `type` and `style`; the default `type="auto"` shows an indicator only when content overflows. Constrain the root height for vertical content. Put padding inside the viewport, never between the track and the root edge.

```tsx
<ScrollArea className="h-64 rounded-sui-lg border border-sui-border-default">
  <ScrollAreaViewport aria-label="Workspace activity">
    <div className="grid gap-4 p-4">{activity}</div>
  </ScrollAreaViewport>
  <ScrollBar />
</ScrollArea>
```

Use `orientation="horizontal"` on ScrollBar for wide content. Viewport exposes a ref to the actual native scrolling element, supports keyboard navigation and inherits the root radius. Wheel, touch, track clicks and thumb dragging share that scroll position. The visible thumb is 4 px wide, sits 4 px inside the edge, and has a 12 px pointer target without reserving a gutter. Hover and dragging use the brand color; reduced motion removes color transitions, and forced colors uses the system foreground. Nested horizontal areas let vertical scrolling reach their parent; applications can opt into containment through `overscroll-behavior` on their viewport. Workshop panels use containment to keep their content between the fixed navigation bars.

The library now exports seven `type/mobile/*` heading roles and matching `text-sui-mobile-*` utilities. Below the existing 640 px breakpoint, ordinary display/heading utilities automatically resolve to the mobile size and line height, including nested Light/Dark boundaries. Body, labels, controls, code and chart metrics keep their existing scales. See the Foundations specimen and [Figma reconciliation record](./figma-responsive-layout.json).

| Role | Desktop size / line height | Mobile size / line height |
| --- | --- | --- |
| display/lg | 48 / 56 | 32 / 40 |
| display/sm | 40 / 48 | 28 / 36 |
| heading/xl | 32 / 40 | 24 / 32 |
| heading/lg | 28 / 36 | 20 / 28 |
| heading/md | 24 / 32 | 20 / 28 |
| heading/sm | 20 / 28 | 18 / 24 |
| heading/xs | 16 / 24 | 16 / 24 |

Existing 24 px container padding and inter-container gaps use 16 px. `padding/card`, `padding/auth-mobile` and `gap/page-section` alias dimension/16; the primitive dimension/24 and space/6 remain available. Card's legacy `comfortable` padding option now resolves to the 16 px card token; the existing `default` 20 px option remains unchanged.
