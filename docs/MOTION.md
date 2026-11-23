# Serenity motion system

Motion makes an action feel acknowledged and its result easy to follow. Serenity responds quickly, travels a short distance and settles gently. Avoid overshoot, bouncing, parallax and cascades that delay useful content. This contract applies to the current React library and future framework adapters.

## Shared rhythm

| Intent | Semantic token | Duration | Use |
| --- | --- | --- | --- |
| Respond | `motion/duration/fast` | 120 ms | Hover/pressed paint, brief compression, dismissals |
| Settle | `motion/duration/standard` | 240 ms | Switch travel and selection confirmation |
| Reveal | `motion/duration/slow` | 800 ms | Surface entrances and graphic appearances |
| Content | Two `motion/duration/slow` intervals | 1,600 ms | Landing sections, FAQ answers, documentation routes and tab panels |

These names describe intent; the existing token names remain compatible. The primitive variables and their semantic aliases are shared with Figma. Edit `tokens/figma-tokens.json`, then regenerate CSS with `npm run tokens`.

- Standard: `cubic-bezier(0.2, 0, 0.2, 1)` gives reversible state changes a soft finish.
- Enter: `cubic-bezier(0.16, 1, 0.3, 1)` establishes direction quickly, then settles.
- Exit: `cubic-bezier(0.4, 0, 1, 1)` clears a dismissed surface promptly.
- Linear remains available for continuous indicators. The approved 14.02-second leaf animation keeps its original timing and easing.

## Component coverage

| Family | Motion behavior | Immediate behavior |
| --- | --- | --- |
| Button, IconButton and password actions | Paint responds in 120 ms; enabled press compresses content to 0.97 scale and returns on release | Events, focus outline, hit target and disabled state |
| Input, Textarea, PasswordInput, OTPInput | Border, background and text paint use Respond | Input values, validation, textarea growth and focus outline |
| Checkbox, Radio, multi-select indicator | Artwork fades in 120 ms and settles from 0.88 to 1 scale in 240 ms | Checked state and form values |
| Switch, Select trigger | Thumb translation and indicator rotation use Settle; track paint uses Respond | Semantic state and selection |
| Select, DropdownMenu, Tooltip, Popover, Dialog, Toast | Opacity, 4 px directional travel and 0.98 entry scale; 800 ms entrance and 120 ms exit | Focus management, announcements and dismissal requests |
| Drawer and overlay | Panel travels 16 px horizontally; backdrop fades; exit uses its own forward keyframes and exit curve | Focus trapping and navigation |
| Tabs, links, Breadcrumb, Pagination, Navbar, Sidebar, Stepper | Shared paint transitions; newly active tab panels reveal over 1,600 ms with 4 px travel | Reading order, selected state, step/page content and sidebar width |
| Badge, Card, Tag, Alert | Shared paint/elevation changes when props or interaction actually change | Passive cards do not acquire hover or click behavior |
| DatePicker, TimePicker, Calendar | Shared surface entrance and day/action paint | Date ranges, clock hand, hour/minute values, calendar geometry and validation |
| DataTable | Row/action paint uses Respond | Sorting, selection, pagination and row geometry |
| Chart and chart widgets | Values and marks grow from zero over 1,600 ms (two slow durations); titles, axes and containers stay visible | Source data and semantic table; targets and scale ceilings |
| Progress and empty-state illustrations | Wrapper reveals once over 800 ms, opacity 0 to 1, translateY 8 px to 0 | Accessible descriptions and determinate values |
| Skeleton and indeterminate Progress | Decorative 2-second cycle (2.5 slow durations) | Loading state and status text |
| Dashboard editor | Held card lifts to 1.02 scale over Settle; floating shadow fades over Respond; full-size destination outline reserves the drop space | Pointer tracking, grid reflow and keyboard moves are immediate. Widgets remain mounted during the gesture. Reduced motion keeps the outline and direct movement without lift scaling. |
| Authentication compositions | Shared form interactions; original decorative leaf timeline | Form state, navigation and validation |

## Implementation rules

`src/motion.css` owns shared interactions. Overlay/picker, table and dashboard styles reuse the same variables. Animate only explicit paint properties, opacity and transforms. Never use `transition: all`, animate control/card layout, defer input updates or delay accessible feedback. Chart value reveals are an explicit exception: decorative mark geometry and counters interpolate within the existing plot, without changing the source data. A transform must not change layout or reduce the control's layout-sized hit target.

CSS transitions naturally reverse from their current value when an action is interrupted. Behavior primitives retain exiting floating surfaces until their CSS animation completes. Do not add JavaScript dismissal timers or keep invisible surfaces interactive. One-shot content entrances should not retain a transform on containers that host positioned elements.

Keep charts mounted during ordinary data updates, which finish immediately. On first presentation or a changed `animationKey`, the chart interpolates visual values from zero. Final maxima, normalization totals, category positions and target markers remain fixed. Donut arcs, stacked percentages, bar lengths, line/area/scatter coordinates and numeric labels share one clock; heatmaps update their discrete intensity levels as counts rise. Avoid a stagger per data point.

The value reveal uses the existing enter curve and two `slow` durations (1,600 ms by default). A native [Web Animations timing effect](https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect/getComputedTiming) supplies eased progress without animating the container. Only the decorative plot rerenders; its semantic data table always exposes final values. Cleanup cancels the frame loop and timing effect on unmount, changed data or replay. `animated={false}`, reduced motion, absent animation APIs and server rendering show final values immediately.

## Reduced motion

`prefers-reduced-motion: reduce` removes spatial transitions, press scaling, popup and chart entrances, and decorative loading movement. Final content remains visible and controls remain usable. The policy covers portals and changes to the OS preference while the page is open. Focus indicators are never animated. The leaf has its existing visible pause control and becomes static with reduced motion.

## Landing viewport and ambient motion

Landing content stays mounted and readable. `useLandingReveal` observes section blocks and reveals each once per visit over two Reveal intervals (1,600 ms), the standard curve and a 16 px upward settle. Blocks entering together use one Respond duration (120 ms) of stagger, capped at two steps. Foundations and FAQ cards enter individually instead of revealing one large group. Finished animations retain no transform. Keyboard focus immediately cancels the affected entrance. Reduced motion, including a live preference change, displays final content without entrances; unavailable observation or animation APIs leave content readable.

Canvas grids use four decorative primary-color glow points per section. Positions snap to the existing 48 px desktop or 32 px mobile grid and change randomly between invisible cycles. Resizing a section or viewport does not reposition visible pulses: each pulse reads the current grid bounds at its next invisible cycle boundary. Only opacity and scale animate; blur is static. Pulses pause outside the viewport, when the document is hidden, and through the existing background pause button. Reduced motion removes the pulse layer. This website treatment does not alter library control motion.

The landing's native CSS cursor uses a small original brand-blue pointer with a white outline on fine, hovering pointers. Links, controls, editable text and disabled states keep their semantic cursors. Touch and forced-color environments retain their platform cursors; there is no pointer-tracking loop or hidden native cursor.

FAQ cards extend their existing IconButton pointer action to the title, answer and padding. The native button remains the single keyboard control, with Enter/Space, expanded state and answer relationship intact. Selecting answer text or activating nested controls does not toggle the card. Reduced motion removes both section and answer entrances.

## Workshop inspection

Open `#motion` for the three rhythms and real controls. Each chart catalog example and chart widget has a Play control that increments `animationKey`. This restarts the value reveal directly, including during a previous reveal, without a skeleton, delay, unmount or fake loading state. The control, chart, axes and table stay mounted, so focus survives. Real `Widget.loading` still represents missing application data and remains separate from this visual animation. Reduced motion shows final values immediately, including when the preference changes during playback.

## Rationale and references

[Carbon's motion guidance](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview) informed the distinction between functional feedback and expressive entrances. Serenity's timings and curves above are a product-specific choice, not Carbon defaults. [W3C guidance on animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) informs the reduced-motion policy.

The workshop borrows the information hierarchy of [shadcn's component documentation](https://ui.shadcn.com/docs/components): one component destination, navigation, examples and opt-in code. It uses Serenity components, original assets, semantic colors and elevation rather than copying shadcn's visual theme.
