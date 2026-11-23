# Implementation status

Serenity UI v0.1.0 is open source under MIT. The public repository contains all implemented components, tokens, examples and technical documentation. No npm registry release has been published yet.

| Block                                                         | Status                                                      |
| ------------------------------------------------------------- | ----------------------------------------------------------- |
| Light/Dark tokens and Tailwind theme                               | Implemented; 808 variables, 44 type styles, 9 effect styles |
| Button, Input, Checkbox, Badge, Card + CardFooter             | Initial implementation with workshop examples and tests     |
| IconButton | Implemented; four variants, three square sizes, accessible names and loading state; dedicated Figma page and workshop examples |
| Textarea, Select, Radio, Switch, OTPInput, PasswordInput      | Implemented; Select supports single/multiple selection, items-only popups and native form values |
| Shared interaction motion | Implemented: Respond 120 ms, Settle 240 ms, Reveal 800 ms and content entrances 1,600 ms (two Reveal intervals); Figma variables synchronized and reduced motion supported. See [motion system](./MOTION.md). |
| Tag, Avatar, Link                                            | Implemented; named identities, explicit removal and native links |
| Tabs, Breadcrumb, Pagination, Navbar, Sidebar, Stepper        | Implemented; Sidebar includes expanded/compact rails and mobile Drawer integration |
| Alert, Toast, Progress, Skeleton, EmptyState                 | Implemented; live feedback, persistent actions and reduced-motion loading |
| Full Solar icon catalog                                      | Pending; approved assets needed by implemented families are included |
| Dialog, Drawer, DropdownMenu, Tooltip, Popover                 | Implemented; focus management, dismissal, shared motion and interactive examples |
| File upload                                                  | Pending                                                     |
| Calendar | Implemented; five-day planner, event activation and responsive/adaptive agenda |
| Table / DataTable | Implemented; controlled row selection, sort requests, paged data, loading/error/empty states and independent row actions with tertiary IconButton controls |
| Chart and Widget | Implemented; 12 data-driven chart variants, 13 widget compositions, semantic data alternatives, state examples and zero-to-value mark/counter animation with reduced motion |
| Configurable dashboard | Implemented; drag the actual widgets in edit mode, pointer/touch movement, keyboard action menus, visibility, live size settings and profile-scoped browser persistence example |
| Task Kanban board | Pending; the delivered dashboard editor organizes widgets, not tasks |
| Shared graphic entrance | Implemented in motion.css and applied to Progress and empty-state illustrations; charts use their own fixed-scaffold value reveal |
| DatePicker and TimePicker | Implemented; single/range date examples, circular hour/minute selection, 12/24-hour switch, staged values and native forms |
| Auth compositions and leaf animation                          | Implemented; AuthLayout, AuthScreen, SignInForm, PasswordRecoveryForm, RecoveryEmailSent, ResetPasswordForm and TwoStepVerificationForm. Six responsive screens, original leaf motion, validation, retry/cancellation, resend cooldown and expired/invalid reset-link states. Authentication services remain application integrations. |
| Vue, Angular, Svelte, Astro                                   | Pending; shared tokens are framework independent            |
| Responsive layout and ScrollArea | Implemented; seven mobile heading styles below 640 px, 16 px compact container spacing, overlay ScrollBar variants and bounded panel scrolling. See Phase 08. |
| Dark theme | Implemented in Figma, shared tokens, workshop and landing; automatic browser preference until a manual Light/Dark override; white Serenity branding in Dark |


The public workshop has one route per component, searchable navigation, Light/Dark themes and source access. Charts replay values from zero. Authentication examples simulate services locally. Full API reference pages, additional framework adapters, real-device verification and broader browser/assistive-technology validation remain future work.

The website is maintained in a separate private repository and consumes the same public kit and workshop shell. Optional donation integration is configured through VITE_DONATION_URL and stays hidden until a valid URL is supplied. See [support](../SUPPORT.md), [installation](./INSTALLATION.md) and [Phase 13](./phases/13-open-source-ecosystem.md).
