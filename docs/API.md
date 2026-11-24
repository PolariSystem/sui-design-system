# Public API reference

Generated from the package declarations. Run `npm run docs:generate` after changing a public contract; `npm run check` rejects stale output. Import public names from `@serenity-ui/react`, not the relative paths shown inside declaration files. Related local types are included below their declaring module. Runtime defaults and interaction guidance live in [component behavior](./COMPONENTS.md), [integration](./INTEGRATION.md) and [file upload](./FILE-UPLOAD.md).

## Alert

Public exports: `Alert`, `AlertProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Alert.tsx)

```ts
// components/Alert.d.ts

import type { ComponentPropsWithoutRef, ReactNode } from "react";
export interface AlertProps extends Omit<ComponentPropsWithoutRef<"div">, "title"> {
    title: ReactNode;
    tone?: "info" | "success" | "warning" | "danger";
    /** Opt into live announcements only for newly arriving messages. Static guidance stays quiet. */
    announcement?: "off" | "polite" | "assertive";
}
/** Inline feedback pairs its semantic tone with explicit text; it never clears field values. */
export declare function Alert({ title, tone, announcement, children, className, ...props }: AlertProps): import("react").JSX.Element;
```

## Auth.types

Public exports: `AuthRequestContext`, `AuthNavigationProps`, `PasswordRecoveryFormProps`, `RecoveryEmailSentProps`, `ResetPasswordFormProps`, `TwoStepVerificationFormProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Auth.types.ts)

```ts
// components/Auth.types.d.ts

import type { LinkProps } from "./Link";
export interface AuthRequestContext {
    signal: AbortSignal;
}
export interface AuthNavigationProps {
    signInHref: string;
    onBackToSignIn?: LinkProps["onClick"];
}
export interface PasswordRecoveryFormProps extends AuthNavigationProps {
    onRequestReset: (email: string, context: AuthRequestContext) => void | Promise<void>;
    defaultEmail?: string;
    /** Safe application-owned feedback, never raw provider exceptions. */
    error?: string;
}
export interface RecoveryEmailSentProps extends AuthNavigationProps {
    email: string;
    onResend: (context: AuthRequestContext) => void | Promise<void>;
    changeEmailHref: string;
    onChangeEmail?: LinkProps["onClick"];
    /** UI delay after entering the screen and after a successful resend. Server throttling remains authoritative. */
    resendCooldownSeconds?: number;
    error?: string;
}
export interface ResetPasswordFormProps extends AuthNavigationProps {
    onResetPassword: (password: string, context: AuthRequestContext) => void | Promise<void>;
    /** The application validates the reset token; the kit never reads or stores it. */
    tokenStatus?: "valid" | "expired" | "invalid";
    requestResetHref: string;
    onRequestNewLink?: LinkProps["onClick"];
    minimumLength?: number;
    /** Additional client policy; return safe error copy. The server still validates the password. */
    validatePassword?: (password: string) => string | undefined;
    error?: string;
}
export interface TwoStepVerificationFormProps extends AuthNavigationProps {
    /** The application owns the challenge identity, expiry and success navigation. */
    onVerify: (code: string, context: AuthRequestContext) => void | Promise<void>;
    error?: string;
}

// components/Link.d.ts

import type { ComponentPropsWithRef } from "react";
export interface LinkProps extends ComponentPropsWithRef<"a"> {
    /** Removes the destination and activation while preserving the unavailable link label. */
    disabled?: boolean;
}
/** A real navigation link; routers can intercept its native click without losing anchor semantics. */
export declare function Link({ disabled, href, onClick, className, tabIndex, ...props }: LinkProps): import("react").JSX.Element;
```

## AuthLayout

Public exports: `AuthLayout`, `AuthLayoutProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/AuthLayout.tsx)

```ts
// components/AuthLayout.d.ts

import { type ReactNode } from "react";
export interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    description?: string;
    footer?: ReactNode;
    /** Replace the default Serenity brand with an accessible product logo. */
    brand?: ReactNode;
    headingLevel?: 1 | 2 | 3;
    /** Decorative indicator above the title, such as the approved success shield. */
    headingIcon?: ReactNode;
    /** Focus changed step headings without moving focus on initial page load. */
    focusHeadingOnChange?: boolean;
    /** False renders a static leaf. OS reduced-motion preferences always take priority. */
    animated?: boolean;
    className?: string;
}
/** Centered access composition; the card grows with errors, translations and enlarged text. */
export declare function AuthLayout({ children, title, description, footer, brand, headingLevel, headingIcon, focusHeadingOnChange, animated, className, }: AuthLayoutProps): import("react").JSX.Element;
```

## AuthScreen

Public exports: `AuthScreen`, `AuthScreenProps`, `AuthScreenState`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/AuthScreen.tsx)

```ts
// components/AuthScreen.d.ts

import { type AuthLayoutProps } from "./AuthLayout";
import { type SignInFormProps } from "./SignInForm";
import type { AuthNavigationProps, PasswordRecoveryFormProps, RecoveryEmailSentProps, ResetPasswordFormProps, TwoStepVerificationFormProps } from "./Auth.types";
/** Each step requires its own integration contract; no credentials or tokens enter the step model. */
export type AuthScreenState = ({
    step: "sign-in";
} & SignInFormProps) | ({
    step: "forgot-password";
} & PasswordRecoveryFormProps) | ({
    step: "check-inbox";
} & RecoveryEmailSentProps) | ({
    step: "reset-password";
} & ResetPasswordFormProps) | ({
    step: "password-updated";
} & AuthNavigationProps) | ({
    step: "verify";
} & TwoStepVerificationFormProps);
export interface AuthScreenProps extends Omit<AuthLayoutProps, "children" | "title" | "description" | "footer" | "headingIcon"> {
    screen: AuthScreenState;
}
/** Controlled access composition. Keep this component mounted as steps change to preserve leaf motion. */
export declare function AuthScreen({ screen, ...layout }: AuthScreenProps): import("react").JSX.Element;

// components/AuthLayout.d.ts

import { type ReactNode } from "react";
export interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    description?: string;
    footer?: ReactNode;
    /** Replace the default Serenity brand with an accessible product logo. */
    brand?: ReactNode;
    headingLevel?: 1 | 2 | 3;
    /** Decorative indicator above the title, such as the approved success shield. */
    headingIcon?: ReactNode;
    /** Focus changed step headings without moving focus on initial page load. */
    focusHeadingOnChange?: boolean;
    /** False renders a static leaf. OS reduced-motion preferences always take priority. */
    animated?: boolean;
    className?: string;
}
/** Centered access composition; the card grows with errors, translations and enlarged text. */
export declare function AuthLayout({ children, title, description, footer, brand, headingLevel, headingIcon, focusHeadingOnChange, animated, className, }: AuthLayoutProps): import("react").JSX.Element;

// components/SignInForm.d.ts

import { type LinkProps } from "./Link";
export interface SignInValues {
    email: string;
    password: string;
    rememberMe: boolean;
}
export interface SignInFormProps {
    /** Resolve after the application handles the result; reject to show a generic retry message.
     * Never persist credentials here. The application owns sessions, MFA and navigation. */
    onSignIn: (values: SignInValues, context: {
        signal: AbortSignal;
    }) => void | Promise<void>;
    forgotPasswordHref: string;
    onForgotPassword?: LinkProps["onClick"];
    defaultEmail?: string;
    defaultRememberMe?: boolean;
    /** Safe, user-facing provider feedback. Do not pass raw server exceptions. */
    error?: string;
    className?: string;
}
/** Native credential fields with password-manager hints, accessible validation and single-flight submit. */
export declare function SignInForm({ onSignIn, forgotPasswordHref, onForgotPassword, defaultEmail, defaultRememberMe, error, className, }: SignInFormProps): import("react").JSX.Element;

// components/Link.d.ts

import type { ComponentPropsWithRef } from "react";
export interface LinkProps extends ComponentPropsWithRef<"a"> {
    /** Removes the destination and activation while preserving the unavailable link label. */
    disabled?: boolean;
}
/** A real navigation link; routers can intercept its native click without losing anchor semantics. */
export declare function Link({ disabled, href, onClick, className, tabIndex, ...props }: LinkProps): import("react").JSX.Element;

// components/Auth.types.d.ts

import type { LinkProps } from "./Link";
export interface AuthRequestContext {
    signal: AbortSignal;
}
export interface AuthNavigationProps {
    signInHref: string;
    onBackToSignIn?: LinkProps["onClick"];
}
export interface PasswordRecoveryFormProps extends AuthNavigationProps {
    onRequestReset: (email: string, context: AuthRequestContext) => void | Promise<void>;
    defaultEmail?: string;
    /** Safe application-owned feedback, never raw provider exceptions. */
    error?: string;
}
export interface RecoveryEmailSentProps extends AuthNavigationProps {
    email: string;
    onResend: (context: AuthRequestContext) => void | Promise<void>;
    changeEmailHref: string;
    onChangeEmail?: LinkProps["onClick"];
    /** UI delay after entering the screen and after a successful resend. Server throttling remains authoritative. */
    resendCooldownSeconds?: number;
    error?: string;
}
export interface ResetPasswordFormProps extends AuthNavigationProps {
    onResetPassword: (password: string, context: AuthRequestContext) => void | Promise<void>;
    /** The application validates the reset token; the kit never reads or stores it. */
    tokenStatus?: "valid" | "expired" | "invalid";
    requestResetHref: string;
    onRequestNewLink?: LinkProps["onClick"];
    minimumLength?: number;
    /** Additional client policy; return safe error copy. The server still validates the password. */
    validatePassword?: (password: string) => string | undefined;
    error?: string;
}
export interface TwoStepVerificationFormProps extends AuthNavigationProps {
    /** The application owns the challenge identity, expiry and success navigation. */
    onVerify: (code: string, context: AuthRequestContext) => void | Promise<void>;
    error?: string;
}
```

## Avatar

Public exports: `Avatar`, `AvatarProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Avatar.tsx)

```ts
// components/Avatar.d.ts

import type { ComponentPropsWithoutRef } from "react";
export interface AvatarProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
    name: string;
    initials?: string;
    size?: 24 | 30 | 32 | 40 | 48;
}
/** Initials identify a person or workspace. Set aria-hidden when adjacent text already names it. */
export declare function Avatar({ name, initials, size, className, ...props }: AvatarProps): import("react").JSX.Element;
```

## Badge

Public exports: `Badge`, `BadgeProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Badge.tsx)

```ts
// components/Badge.d.ts

import type { ComponentPropsWithoutRef, ReactNode } from "react";
export interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
    tone?: "neutral" | "info" | "success" | "warning" | "danger";
    size?: "sm" | "md";
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}
/**
 * Noninteractive status label. Tone complements its text, never replaces it.
 * Live announcements belong to the consuming flow, so no role="status" is added here.
 */
export declare function Badge({ tone, size, leftIcon, rightIcon, children, className, ...props }: BadgeProps): import("react").JSX.Element;
```

## Breadcrumb

Public exports: `Breadcrumb`, `BreadcrumbProps`, `BreadcrumbItem`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Breadcrumb.tsx)

```ts
// components/Breadcrumb.d.ts

import { type ComponentPropsWithoutRef, type ReactNode } from "react";
export interface BreadcrumbItem {
    label: string;
    href?: string;
}
export interface BreadcrumbProps extends Omit<ComponentPropsWithoutRef<"nav">, "children"> {
    items: BreadcrumbItem[];
    /** Compact trails show the nearest parent and current location. */
    compact?: boolean;
    leadingAction?: ReactNode;
}
/** The current location is text, not a redundant link. Keep destinations owned by the application. */
export declare function Breadcrumb({ items, compact, leadingAction, className, "aria-label": label, ...props }: BreadcrumbProps): import("react").JSX.Element;
```

## Button

Public exports: `Button`, `ButtonProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Button.tsx)

```ts
// components/Button.d.ts

import type { ComponentPropsWithRef, ReactNode } from "react";
export interface ButtonProps extends ComponentPropsWithRef<"button"> {
    variant?: "primary" | "secondary" | "tertiary" | "danger";
    size?: "sm" | "md" | "lg";
    /** Uses compact padding for a decorative icon child. Supply aria-label for its action. */
    iconOnly?: boolean;
    /** Prevents activation and exposes aria-busy while an action is pending. */
    loading?: boolean;
    /** Replaces the visible and accessible label while loading; localize at the call site. */
    loadingLabel?: string;
    /** Decorative content only. The button label supplies its accessible name. */
    leftIcon?: ReactNode;
    /** Decorative content only; do not nest another interactive control here. */
    rightIcon?: ReactNode;
}
/**
 * Native action button. Defaults to type="button" to avoid accidental form submission.
 * Minimum heights preserve the Figma sizes while allowing enlarged text to grow.
 */
export declare function Button({ variant, size, iconOnly, loading, loadingLabel, leftIcon, rightIcon, children, disabled, type, className, ...props }: ButtonProps): import("react").JSX.Element;
```

## Calendar

Public exports: `Calendar`, `CalendarProps`, `CalendarEvent`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Calendar.tsx)

```ts
// components/Calendar.d.ts

export interface CalendarEvent {
    id: string;
    date: string;
    start: string;
    end: string;
    title: string;
    type?: "meeting" | "note";
    tone?: "default" | "success";
    initials?: string;
}
export interface CalendarProps {
    /** ISO date for the first visible day. The standard workweek displays five days. */
    startDate: string;
    events: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
    today?: string;
    locale?: string;
    startHour?: number;
    endHour?: number;
    label?: string;
}
/** Weekly planner with a chronological agenda on narrow screens. Events remain ordinary named buttons. */
export declare function Calendar({ startDate, events, onEventClick, today, locale, startHour, endHour, label, }: CalendarProps): import("react").JSX.Element;
```

## Card

Public exports: `Card`, `CardFooter`, `CardProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Card.tsx)

```ts
// components/Card.d.ts

import type { ComponentPropsWithoutRef } from "react";
export interface CardProps extends ComponentPropsWithoutRef<"div"> {
    /** Padding variants retain compatibility and share the 16 px card spacing. */
    padding?: "compact" | "default" | "comfortable";
    elevation?: "subtle" | "floating";
}
/**
 * Surface primitive with content-driven height. Consumers provide headings and semantics.
 * Default subtle elevation separates cards from the canvas at every viewport size;
 * elevation alone does not turn this container into a dialog or an interactive widget.
 */
export declare function Card({ padding, elevation, className, ...props }: CardProps): import("react").JSX.Element;
/**
 * Place the primary action first in the DOM for mobile reading and keyboard order.
 * Actions fill a vertical stack on mobile; desktop keeps the primary at the right.
 */
export declare function CardFooter({ className, ...props }: ComponentPropsWithoutRef<"div">): import("react").JSX.Element;
```

## Chart

Public exports: `Chart`, `ChartProps`, `ChartDatum`, `ChartMatrixRow`, `ChartPoint`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Chart.tsx)

```ts
// components/Chart.d.ts

import type { ChartProps } from "./Chart.types";
export type { ChartProps, ChartDatum, ChartMatrixRow, ChartPoint, } from "./Chart.types";
/** Responsive, zero-based visualizations with an always-available semantic data alternative. */
export declare function Chart(props: ChartProps): import("react").JSX.Element;

// components/Chart.types.d.ts

export interface ChartDatum {
    id: string;
    label: string;
    value: number;
}
export interface ChartMatrixRow {
    id: string;
    label: string;
    values: readonly number[];
}
export interface ChartPoint {
    id: string;
    label: string;
    x: number;
    y: number;
}
interface ChartBase {
    label: string;
    /** Animate visual values from zero on first data presentation. Reduced motion always wins. */
    animated?: boolean;
    /** Change this key to replay values without unmounting the chart, axes or data table. */
    animationKey?: string | number;
    description?: string;
    className?: string;
    /** The same data table is always available to assistive technology. */
    showDataTable?: boolean;
    dataTableLabel?: string;
    emptyLabel?: string;
    emptyDescription?: string;
    formatValue?: (value: number) => string;
    categoryLabel?: string;
    valueLabel?: string;
}
interface SeriesChart extends ChartBase {
    type: "line" | "area" | "column" | "histogram" | "horizontal-bar" | "funnel";
    data: readonly ChartDatum[];
    /** Positive zero-based ceiling; must include every value. Auto-derived when omitted. */
    max?: number;
    note?: string;
}
interface MetricChart extends ChartBase {
    type: "metric";
    value: number;
    data: readonly ChartDatum[];
    comparison?: string;
    comparisonTone?: "neutral" | "success" | "danger";
}
interface DonutChart extends ChartBase {
    type: "donut";
    /** At most six parts; zero-valued parts remain in the legend and data table. */
    data: readonly ChartDatum[];
    unit?: string;
}
interface GoalChart extends ChartBase {
    type: "goal";
    value: number;
    max: number;
    target?: number;
    summary?: string;
}
interface StackedChart extends ChartBase {
    type: "stacked-bar";
    /** One to six series. Values are normalized per row; an all-zero row stays empty. */
    series: readonly string[];
    data: readonly ChartMatrixRow[];
}
interface HeatmapChart extends ChartBase {
    type: "heatmap";
    columns: readonly string[];
    data: readonly ChartMatrixRow[];
    max?: number;
    note?: string;
}
interface ScatterChart extends ChartBase {
    type: "scatter";
    data: readonly ChartPoint[];
    xLabel: string;
    yLabel: string;
    xMax?: number;
    yMax?: number;
}
/** Count-based charts accept finite nonnegative values, with unique, nonempty data IDs. */
export type ChartProps = SeriesChart | MetricChart | DonutChart | GoalChart | StackedChart | HeatmapChart | ScatterChart;
export {};
```

## Checkbox

Public exports: `Checkbox`, `CheckboxProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Checkbox.tsx)

```ts
// components/Checkbox.d.ts

import { type ComponentPropsWithRef, type ReactNode } from "react";
export interface CheckboxProps extends Omit<ComponentPropsWithRef<"input">, "type" | "size" | "children"> {
    label: ReactNode;
    /** Visual mixed state, independent of checked. Native form submission still uses checked. */
    indeterminate?: boolean;
    /** The approved Records table uses a 16 px control; other fields default to 20 px. */
    size?: 16 | 20;
}
/**
 * Native form control with Solar Unread artwork layered above it.
 * The input retains focus, keyboard behavior and form semantics; artwork is decorative.
 */
export declare function Checkbox({ label, indeterminate, size, disabled, className, ref, ...props }: CheckboxProps): import("react").JSX.Element;
```

## Dashboard

Public exports: `Dashboard`, `moveDashboardItem`, `restoreDashboardLayout`, `serializeDashboardLayout`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Dashboard.tsx)

```ts
// components/Dashboard.d.ts

import type { DashboardProps } from "./Dashboard.types";
export type * from "./Dashboard.types";
export { moveDashboardItem, restoreDashboardLayout, serializeDashboardLayout, } from "./internal/dashboard-layout";
/** Responsive layout without visual reordering: DOM, keyboard and reading order stay aligned. */
export declare function Dashboard({ widgets, value, renderWidget, children, className, }: DashboardProps): import("react").JSX.Element;

// components/Dashboard.types.d.ts

import type { ReactNode } from "react";
export type DashboardZone = "summary" | "analysis" | "hidden";
export type DashboardSize = "S" | "M" | "L";
export interface DashboardItem {
    id: string;
    zone: DashboardZone;
    size: DashboardSize;
}
/** Array order is reading order within each zone. IDs must be stable across sessions. */
export type DashboardLayout = readonly DashboardItem[];
export interface DashboardWidgetDefinition {
    id: string;
    title: string;
    kind: string;
    defaultZone: Exclude<DashboardZone, "hidden">;
    defaultSize: DashboardSize;
    /** Restrict sizes when a visualization cannot remain readable in a small card. */
    sizes: readonly DashboardSize[];
}
export interface DashboardProps {
    widgets: readonly DashboardWidgetDefinition[];
    value: DashboardLayout;
    renderWidget: (widget: DashboardWidgetDefinition, item: DashboardItem) => ReactNode;
    /** Records or other fixed content remain outside customizable zones. */
    children?: ReactNode;
    className?: string;
}
export interface DashboardEditorProps {
    widgets: readonly DashboardWidgetDefinition[];
    value: DashboardLayout;
    /** Updates a draft. Saving, cancellation and persistence belong to the consumer. */
    onChange: (layout: DashboardItem[]) => void;
    /** Render actual widgets in their responsive grid. Omit for the compact zone-management view.
     * Hidden widgets are restored through the consumer's catalog in this mode. */
    renderWidget?: DashboardProps["renderWidget"];
    className?: string;
}

// components/internal/dashboard-layout.d.ts

import type { DashboardItem, DashboardLayout, DashboardWidgetDefinition, DashboardZone } from "../Dashboard.types";
export declare const dashboardZones: readonly ["summary", "analysis", "hidden"];
export declare const dashboardZoneNames: {
    summary: string;
    analysis: string;
    hidden: string;
};
/** Reject programming errors; use restoreDashboardLayout for untrusted persisted data. */
export declare function validateDashboardLayout(widgets: readonly DashboardWidgetDefinition[], value: DashboardLayout): void;
/** Move before a target or append to a zone. Other widgets retain their relative order. */
export declare function moveDashboardItem(value: DashboardLayout, id: string, zone: DashboardZone, beforeId?: string): DashboardItem[];
/** Versioned, metadata-only persistence. Never serialize widget content or business data. */
export declare function serializeDashboardLayout(value: DashboardLayout): string;
/** Reconcile old catalogs safely: discard removed/duplicate entries and append newly available widgets. */
export declare function restoreDashboardLayout(serialized: string | null, widgets: readonly DashboardWidgetDefinition[], defaults: DashboardLayout): DashboardItem[];
```

## Dashboard.types

Public exports: `DashboardProps`, `DashboardEditorProps`, `DashboardItem`, `DashboardLayout`, `DashboardSize`, `DashboardZone`, `DashboardWidgetDefinition`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Dashboard.types.ts)

```ts
// components/Dashboard.types.d.ts

import type { ReactNode } from "react";
export type DashboardZone = "summary" | "analysis" | "hidden";
export type DashboardSize = "S" | "M" | "L";
export interface DashboardItem {
    id: string;
    zone: DashboardZone;
    size: DashboardSize;
}
/** Array order is reading order within each zone. IDs must be stable across sessions. */
export type DashboardLayout = readonly DashboardItem[];
export interface DashboardWidgetDefinition {
    id: string;
    title: string;
    kind: string;
    defaultZone: Exclude<DashboardZone, "hidden">;
    defaultSize: DashboardSize;
    /** Restrict sizes when a visualization cannot remain readable in a small card. */
    sizes: readonly DashboardSize[];
}
export interface DashboardProps {
    widgets: readonly DashboardWidgetDefinition[];
    value: DashboardLayout;
    renderWidget: (widget: DashboardWidgetDefinition, item: DashboardItem) => ReactNode;
    /** Records or other fixed content remain outside customizable zones. */
    children?: ReactNode;
    className?: string;
}
export interface DashboardEditorProps {
    widgets: readonly DashboardWidgetDefinition[];
    value: DashboardLayout;
    /** Updates a draft. Saving, cancellation and persistence belong to the consumer. */
    onChange: (layout: DashboardItem[]) => void;
    /** Render actual widgets in their responsive grid. Omit for the compact zone-management view.
     * Hidden widgets are restored through the consumer's catalog in this mode. */
    renderWidget?: DashboardProps["renderWidget"];
    className?: string;
}
```

## DashboardEditor

Public exports: `DashboardEditor`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/DashboardEditor.tsx)

```ts
// components/DashboardEditor.d.ts

import type { DashboardEditorProps } from "./Dashboard.types";
/** Controlled draft editor. Pointer handles and explicit controls use the same move operation. */
export declare function DashboardEditor({ widgets, value, onChange, renderWidget, className, }: DashboardEditorProps): import("react").JSX.Element;

// components/Dashboard.types.d.ts

import type { ReactNode } from "react";
export type DashboardZone = "summary" | "analysis" | "hidden";
export type DashboardSize = "S" | "M" | "L";
export interface DashboardItem {
    id: string;
    zone: DashboardZone;
    size: DashboardSize;
}
/** Array order is reading order within each zone. IDs must be stable across sessions. */
export type DashboardLayout = readonly DashboardItem[];
export interface DashboardWidgetDefinition {
    id: string;
    title: string;
    kind: string;
    defaultZone: Exclude<DashboardZone, "hidden">;
    defaultSize: DashboardSize;
    /** Restrict sizes when a visualization cannot remain readable in a small card. */
    sizes: readonly DashboardSize[];
}
export interface DashboardProps {
    widgets: readonly DashboardWidgetDefinition[];
    value: DashboardLayout;
    renderWidget: (widget: DashboardWidgetDefinition, item: DashboardItem) => ReactNode;
    /** Records or other fixed content remain outside customizable zones. */
    children?: ReactNode;
    className?: string;
}
export interface DashboardEditorProps {
    widgets: readonly DashboardWidgetDefinition[];
    value: DashboardLayout;
    /** Updates a draft. Saving, cancellation and persistence belong to the consumer. */
    onChange: (layout: DashboardItem[]) => void;
    /** Render actual widgets in their responsive grid. Omit for the compact zone-management view.
     * Hidden widgets are restored through the consumer's catalog in this mode. */
    renderWidget?: DashboardProps["renderWidget"];
    className?: string;
}
```

## DataTable

Public exports: `DataTable`, `DataTableProps`, `DataTableColumn`, `DataTableSort`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/DataTable.tsx)

```ts
// components/DataTable.d.ts

import type { CSSProperties, ReactNode } from "react";
import { type PaginationProps } from "./Pagination";
export interface DataTableSort {
    columnId: string;
    direction: "ascending" | "descending";
}
export interface DataTableColumn<T> {
    id: string;
    header: string;
    cell: (row: T) => ReactNode;
    /** Enables a sort request; the owner supplies the resulting row order. */
    sortable?: boolean;
    width?: CSSProperties["width"];
    minWidth?: CSSProperties["minWidth"];
    leftIcon?: (row: T) => ReactNode;
    rightIcon?: (row: T) => ReactNode;
}
export interface DataTableProps<T> {
    label: string;
    columns: readonly DataTableColumn<T>[];
    /** Visible page only. Filtering, sorting and pagination belong to the data owner. */
    rows: readonly T[];
    getRowId: (row: T) => string;
    getRowLabel: (row: T) => string;
    /** Renders an independent trailing cell. Use tertiary IconButton controls with row-specific names. */
    rowActions?: (row: T) => ReactNode;
    /** Screen-reader-only column heading; no visible title is rendered. */
    actionsLabel?: string;
    selection?: {
        selectedIds: readonly string[];
        onSelectedIdsChange: (ids: string[]) => void;
        isRowSelectable?: (row: T) => boolean;
        selectPageLabel?: string;
        getSelectionLabel?: (row: T) => string;
    };
    sort?: DataTableSort | null;
    onSortChange?: (sort: DataTableSort) => void;
    getSortLabel?: (column: DataTableColumn<T>) => string;
    pagination?: Pick<PaginationProps, "page" | "totalItems" | "pageSize" | "onPageChange" | "previousLabel" | "nextLabel" | "formatRange" | "getPageLabel">;
    loading?: boolean;
    loadingLabel?: string;
    error?: ReactNode;
    emptyState?: ReactNode;
    className?: string;
}
/** Controlled data presentation. Stable IDs preserve selection across pages and sorting. */
export declare function DataTable<T>({ label, columns, rows, getRowId, getRowLabel, rowActions, actionsLabel, selection, sort, onSortChange, getSortLabel, pagination, loading, loadingLabel, error, emptyState, className, }: DataTableProps<T>): import("react").JSX.Element;

// components/Pagination.d.ts

import type { ComponentPropsWithoutRef } from "react";
export interface PaginationProps extends Omit<ComponentPropsWithoutRef<"nav">, "children" | "onChange"> {
    page: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
    previousLabel?: string;
    nextLabel?: string;
    getPageLabel?: (page: number) => string;
    formatRange?: (start: number, end: number, total: number) => string;
}
/** Controlled pagination. The parent loads/slices data; this component never changes the table. */
export declare function Pagination({ page, totalItems, pageSize, onPageChange, disabled, previousLabel, nextLabel, getPageLabel, formatRange, className, "aria-label": label, ...props }: PaginationProps): import("react").JSX.Element;
```

## DateCalendar

Public exports: `DateCalendar`, `DateCalendarProps`, `DateRange`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/DateCalendar.tsx)

```ts
// components/DateCalendar.d.ts

export interface DateRange {
    start: string;
    end: string;
}
export interface DateCalendarProps {
    value?: string;
    range?: DateRange;
    mode?: "single" | "range";
    onSelect?: (date: string) => void;
    min?: string;
    max?: string;
    isDateUnavailable?: (date: string) => boolean;
    defaultMonth?: string;
    today?: string;
    locale?: string;
    autoFocus?: boolean;
}
/** Monday-first date grid. Focus and selection are independent; unavailable dates remain discoverable. */
export declare function DateCalendar({ value, range, mode, onSelect, min, max, isDateUnavailable, defaultMonth, today, locale, autoFocus, }: DateCalendarProps): import("react").JSX.Element;
```

## DatePicker

Public exports: `DatePicker`, `DatePickerProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/DatePicker.tsx)

```ts
// components/DatePicker.d.ts

import { type DateRange } from "./DateCalendar";
import { type PickerFieldProps } from "./internal/PickerField";
interface DatePickerBase extends PickerFieldProps {
    min?: string;
    max?: string;
    isDateUnavailable?: (date: string) => boolean;
    defaultMonth?: string;
    locale?: string;
    applyLabel?: string;
    clearLabel?: string;
}
export type DatePickerProps = DatePickerBase & ({
    mode?: "single";
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
} | {
    mode: "range";
    value?: DateRange;
    defaultValue?: DateRange;
    onValueChange?: (value: DateRange) => void;
});
/** ISO date values are committed only by Apply. Range form values use start/end names. */
export declare function DatePicker(props: DatePickerProps): import("react").JSX.Element;
export {};

// components/DateCalendar.d.ts

export interface DateRange {
    start: string;
    end: string;
}
export interface DateCalendarProps {
    value?: string;
    range?: DateRange;
    mode?: "single" | "range";
    onSelect?: (date: string) => void;
    min?: string;
    max?: string;
    isDateUnavailable?: (date: string) => boolean;
    defaultMonth?: string;
    today?: string;
    locale?: string;
    autoFocus?: boolean;
}
/** Monday-first date grid. Focus and selection are independent; unavailable dates remain discoverable. */
export declare function DateCalendar({ value, range, mode, onSelect, min, max, isDateUnavailable, defaultMonth, today, locale, autoFocus, }: DateCalendarProps): import("react").JSX.Element;

// components/internal/PickerField.d.ts

import { type ReactNode, type RefObject, type ComponentPropsWithRef } from "react";
import { type FieldProps } from "./Field";
export interface PickerFieldProps extends FieldProps {
    name?: string;
    form?: string;
    readOnly?: boolean;
    placeholder?: string;
    "aria-describedby"?: string;
    /** Visible button ref and events for focus management and touched-state integration. */
    triggerProps?: Omit<ComponentPropsWithRef<"button">, "children" | "id" | "disabled" | "type" | "role">;
}
/** A button provides the visible control; the native bridge preserves submission and required validation. */
export declare function PickerField({ displayValue, serializedValue, validationMessage, icon, open, onOpenChange, inputRef, children, placeholder, name, form, readOnly, disabled, required, triggerProps, "aria-describedby": describedBy, ...field }: PickerFieldProps & {
    displayValue: string;
    serializedValue: string;
    validationMessage?: string;
    icon: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inputRef: RefObject<HTMLInputElement | null>;
    children: ReactNode;
}): import("react").JSX.Element;

// components/internal/Field.d.ts

import { type ReactNode } from "react";
export interface FieldProps {
    label: string;
    hideLabel?: boolean;
    helperText?: string;
    error?: string;
    id?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}
interface FieldControl {
    id: string;
    "aria-describedby": string | undefined;
}
/** Shared label/message wiring; each control retains its own native semantics. */
export declare function Field({ label, hideLabel, helperText, error, id, required, disabled, className, describedBy, children, labelTone, }: FieldProps & {
    describedBy?: string;
    labelTone?: "primary" | "body";
    children: (control: FieldControl) => ReactNode;
}): import("react").JSX.Element;
export {};
```

## Dialog

Public exports: `Dialog`, `DialogTrigger`, `DialogClose`, `DialogContent`, `DialogProps`, `DialogContentProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Dialog.tsx)

```ts
// components/Dialog.d.ts

import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode } from "react";
import * as Primitive from "@radix-ui/react-dialog";
export type DialogProps = ComponentPropsWithoutRef<typeof Primitive.Root>;
export declare const Dialog: import("react").FC<Primitive.DialogProps>;
export declare const DialogTrigger: import("react").ForwardRefExoticComponent<Primitive.DialogTriggerProps & import("react").RefAttributes<HTMLButtonElement>>;
export declare const DialogClose: import("react").ForwardRefExoticComponent<Primitive.DialogCloseProps & import("react").RefAttributes<HTMLButtonElement>>;
export interface DialogContentProps extends Omit<ComponentPropsWithRef<typeof Primitive.Content>, "title" | "asChild"> {
    title: string;
    description?: string;
    icon?: ReactNode;
    footer?: ReactNode;
    closeLabel?: string;
    showClose?: boolean;
    variant?: "standard" | "featured";
}
/** Modal surface with named content, focus containment and restoration supplied by Radix. */
export declare function DialogContent({ title, description, icon, footer, closeLabel, showClose, variant, children, className, ...props }: DialogContentProps): import("react").JSX.Element;
```

## Drawer

Public exports: `Drawer`, `DrawerTrigger`, `DrawerClose`, `DrawerContent`, `DrawerProps`, `DrawerContentProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Drawer.tsx)

```ts
// components/Drawer.d.ts

import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode } from "react";
import * as Primitive from "@radix-ui/react-dialog";
export type DrawerProps = ComponentPropsWithoutRef<typeof Primitive.Root>;
export declare const Drawer: import("react").FC<Primitive.DialogProps>;
export declare const DrawerTrigger: import("react").ForwardRefExoticComponent<Primitive.DialogTriggerProps & import("react").RefAttributes<HTMLButtonElement>>;
export declare const DrawerClose: import("react").ForwardRefExoticComponent<Primitive.DialogCloseProps & import("react").RefAttributes<HTMLButtonElement>>;
export interface DrawerContentProps extends Omit<ComponentPropsWithRef<typeof Primitive.Content>, "title" | "asChild"> {
    title: string;
    description?: string;
    footer?: ReactNode;
    /** Optional navigation identity, shown above the title alongside the close action. */
    brand?: ReactNode;
    /** Decorative close artwork; closeLabel supplies the accessible action name. */
    closeIcon?: ReactNode;
    closeLabel?: string;
    side?: "left" | "right";
    size?: "content" | "navigation";
}
/** Modal side panel. Internal scrolling preserves the reachable heading and close action. */
export declare function DrawerContent({ title, description, footer, brand, closeIcon: closeArtwork, closeLabel, side, size, children, className, ...props }: DrawerContentProps): import("react").JSX.Element;
```

## DropdownMenu

Public exports: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuProps`, `DropdownMenuContentProps`, `DropdownMenuItemProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/DropdownMenu.tsx)

```ts
// components/DropdownMenu.d.ts

import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode } from "react";
import * as Primitive from "@radix-ui/react-dropdown-menu";
export type DropdownMenuProps = ComponentPropsWithoutRef<typeof Primitive.Root>;
export type DropdownMenuContentProps = ComponentPropsWithRef<typeof Primitive.Content>;
export interface DropdownMenuItemProps extends ComponentPropsWithRef<typeof Primitive.Item> {
    danger?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}
export declare const DropdownMenu: import("react").FC<Primitive.DropdownMenuProps>;
export declare const DropdownMenuTrigger: import("react").ForwardRefExoticComponent<Primitive.DropdownMenuTriggerProps & import("react").RefAttributes<HTMLButtonElement>>;
/** Actions use menu semantics; selecting field values remains the Select component's responsibility. */
export declare function DropdownMenuContent({ className, sideOffset, collisionPadding, ...props }: DropdownMenuContentProps): import("react").JSX.Element;
/** With asChild, supply one control that forwards its props and ref; icons remain decorative. */
export declare function DropdownMenuItem({ asChild, danger, leftIcon, rightIcon, children, className, ...props }: DropdownMenuItemProps): import("react").JSX.Element;
```

## EmptyState

Public exports: `EmptyState`, `EmptyStateProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/EmptyState.tsx)

```ts
// components/EmptyState.d.ts

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { type EmptyStateIllustrationName } from "./EmptyStateIllustration";
export interface EmptyStateProps extends Omit<ComponentPropsWithoutRef<"div">, "title"> {
    title: string;
    description: ReactNode;
    action?: ReactNode;
    icon?: ReactNode;
    /** Subtle presentation shares the surrounding surface without a nested card. */
    variant?: "card" | "subtle";
    /** A full illustration takes precedence over the small icon slot. */
    illustration?: EmptyStateIllustrationName;
    headingLevel?: 2 | 3 | 4;
}
/** Empty and no-results states share a surface; applications supply accurate wording and recovery. */
export declare function EmptyState({ title, description, action, icon, variant, illustration, headingLevel, className, ...props }: EmptyStateProps): import("react").JSX.Element;

// components/EmptyStateIllustration.d.ts

declare const illustrations: {
    readonly error: string;
    readonly search: string;
    readonly wallet: string;
    readonly "card-error": string;
    readonly files: string;
    readonly chat: string;
    readonly products: string;
    readonly purchases: string;
    readonly content: string;
    readonly saved: string;
    readonly connection: string;
    readonly "payment-success": string;
    readonly "payment-error": string;
};
export type EmptyStateIllustrationName = keyof typeof illustrations;
export interface EmptyStateIllustrationProps {
    name: EmptyStateIllustrationName;
    className?: string;
}
/** Decorative Figma artwork. Supply its meaning through the surrounding heading and copy. */
export declare function EmptyStateIllustration({ name, className, }: EmptyStateIllustrationProps): import("react").JSX.Element;
export {};
```

## EmptyStateIllustration

Public exports: `EmptyStateIllustration`, `EmptyStateIllustrationName`, `EmptyStateIllustrationProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/EmptyStateIllustration.tsx)

```ts
// components/EmptyStateIllustration.d.ts

declare const illustrations: {
    readonly error: string;
    readonly search: string;
    readonly wallet: string;
    readonly "card-error": string;
    readonly files: string;
    readonly chat: string;
    readonly products: string;
    readonly purchases: string;
    readonly content: string;
    readonly saved: string;
    readonly connection: string;
    readonly "payment-success": string;
    readonly "payment-error": string;
};
export type EmptyStateIllustrationName = keyof typeof illustrations;
export interface EmptyStateIllustrationProps {
    name: EmptyStateIllustrationName;
    className?: string;
}
/** Decorative Figma artwork. Supply its meaning through the surrounding heading and copy. */
export declare function EmptyStateIllustration({ name, className, }: EmptyStateIllustrationProps): import("react").JSX.Element;
export {};
```

## FileUpload

Public exports: `FileUpload`, `FileUploadProps`, `FileRejection`, `FileRejectionCode`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/FileUpload.tsx)

```ts
// components/FileUpload.d.ts

import { type ComponentPropsWithRef, type Ref } from "react";
import { type FileRejection } from "./internal/file-selection";
export type { FileRejection, FileRejectionCode, } from "./internal/file-selection";
export interface FileUploadProps extends Omit<ComponentPropsWithRef<"div">, "children" | "onDrop" | "onDragEnter" | "onDragLeave" | "onDragOver"> {
    label: string;
    helperText?: string;
    error?: string;
    accept?: string;
    multiple?: boolean;
    /** Maximum bytes per file. Omit for no client-side size limit. */
    maxSize?: number;
    /** Maximum accepted files in this selection, not in an application-owned queue. */
    maxFiles?: number;
    disabled?: boolean;
    browseLabel?: string;
    dropLabel?: string;
    disabledLabel?: string;
    errorLabel?: string;
    onFilesSelect: (files: File[]) => void;
    onReject?: (rejections: FileRejection[]) => void;
    rejectionMessage?: (rejection: FileRejection) => string;
    inputRef?: Ref<HTMLInputElement>;
    triggerProps?: Omit<ComponentPropsWithRef<"button">, "children" | "type" | "disabled">;
}
/**
 * Selection only: accepted File objects are delivered to the application, never uploaded here.
 * The native picker resets after selection so the same file can be retried. Submit files through
 * application-owned FormData; this control deliberately does not serialize a form field.
 */
export declare function FileUpload({ label, helperText, error, accept, multiple, maxSize, maxFiles, disabled, browseLabel, dropLabel, disabledLabel, errorLabel, onFilesSelect, onReject, rejectionMessage, inputRef, triggerProps, className, ...props }: FileUploadProps): import("react").JSX.Element;

// components/internal/file-selection.d.ts

export type FileRejectionCode = "type" | "size" | "count";
export interface FileRejection {
    file: File;
    code: FileRejectionCode;
}
/** Browser accept rules are usability filters; a server must validate uploaded content independently. */
export declare function selectFiles(files: readonly File[], accept: string, maxBytes: number, maxFiles: number): {
    accepted: File[];
    rejected: FileRejection[];
};
```

## FileUploadItem

Public exports: `FileUploadItem`, `FileUploadItemProps`, `FileUploadStatus`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/FileUploadItem.tsx)

```ts
// components/FileUploadItem.d.ts

import type { ComponentPropsWithRef } from "react";
export type FileUploadStatus = "queued" | "uploading" | "success" | "error" | "cancelled";
export interface FileUploadItemProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
    name: string;
    detail?: string;
    status: FileUploadStatus;
    /** Omit while uploading when the transport cannot measure progress. 100 is not server success. */
    progress?: number;
    statusLabel?: string;
    error?: string;
    disabled?: boolean;
    onCancel?: () => void;
    onRetry?: () => void;
    onRemove?: () => void;
    cancelLabel?: string;
    retryLabel?: string;
    removeLabel?: string;
    progressLabel?: string;
}
/** A controlled transfer row. Status changes and cancellation are owned by the application. */
export declare function FileUploadItem({ name, detail, status, progress, statusLabel, error, disabled, onCancel, onRetry, onRemove, cancelLabel, retryLabel, removeLabel, progressLabel, className, ...props }: FileUploadItemProps): import("react").JSX.Element;
```

## IconButton

Public exports: `IconButton`, `IconButtonProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/IconButton.tsx)

```ts
// components/IconButton.d.ts

import type { ReactNode } from "react";
import { type ButtonProps } from "./Button";
export interface IconButtonProps extends Omit<ButtonProps, "children" | "iconOnly" | "leftIcon" | "rightIcon" | "aria-label"> {
    /** Describes the action, rather than the icon's appearance. Localize at the call site. */
    "aria-label": string;
    /** A decorative Solar Bold icon; do not nest interactive content. */
    icon: ReactNode;
}
/** Square action control sharing Button's native semantics, states and motion policy. */
export declare function IconButton({ icon, size, variant, className, ...props }: IconButtonProps): import("react").JSX.Element;

// components/Button.d.ts

import type { ComponentPropsWithRef, ReactNode } from "react";
export interface ButtonProps extends ComponentPropsWithRef<"button"> {
    variant?: "primary" | "secondary" | "tertiary" | "danger";
    size?: "sm" | "md" | "lg";
    /** Uses compact padding for a decorative icon child. Supply aria-label for its action. */
    iconOnly?: boolean;
    /** Prevents activation and exposes aria-busy while an action is pending. */
    loading?: boolean;
    /** Replaces the visible and accessible label while loading; localize at the call site. */
    loadingLabel?: string;
    /** Decorative content only. The button label supplies its accessible name. */
    leftIcon?: ReactNode;
    /** Decorative content only; do not nest another interactive control here. */
    rightIcon?: ReactNode;
}
/**
 * Native action button. Defaults to type="button" to avoid accidental form submission.
 * Minimum heights preserve the Figma sizes while allowing enlarged text to grow.
 */
export declare function Button({ variant, size, iconOnly, loading, loadingLabel, leftIcon, rightIcon, children, disabled, type, className, ...props }: ButtonProps): import("react").JSX.Element;
```

## Input

Public exports: `Input`, `InputProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Input.tsx)

```ts
// components/Input.d.ts

import type { ComponentPropsWithRef, ReactNode } from "react";
export interface InputProps extends Omit<ComponentPropsWithRef<"input">, "size"> {
    label: string;
    /** Visually hides the label while keeping the input programmatically named. */
    hideLabel?: boolean;
    helperText?: string;
    error?: string;
    size?: "compact" | "standard";
    /** Decorative slots must not contain focusable controls. */
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}
/** Labeled native input; className styles the wrapper and ref reaches the input. */
export declare function Input(props: InputProps): import("react").JSX.Element;
export declare function InputField({ label, hideLabel, helperText, error, size, leftIcon, rightIcon, id, required, disabled, readOnly, className, trailingAction, "aria-describedby": describedBy, ...props }: InputProps & {
    trailingAction?: ReactNode;
}): import("react").JSX.Element;
```

## Link

Public exports: `Link`, `LinkProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Link.tsx)

```ts
// components/Link.d.ts

import type { ComponentPropsWithRef } from "react";
export interface LinkProps extends ComponentPropsWithRef<"a"> {
    /** Removes the destination and activation while preserving the unavailable link label. */
    disabled?: boolean;
}
/** A real navigation link; routers can intercept its native click without losing anchor semantics. */
export declare function Link({ disabled, href, onClick, className, tabIndex, ...props }: LinkProps): import("react").JSX.Element;
```

## Navbar

Public exports: `Navbar`, `NavbarSearch`, `NavbarProps`, `NavbarSearchProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Navbar.tsx)

```ts
// components/Navbar.d.ts

import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode } from "react";
import { type NavigationItemProps } from "./NavigationItem";
export interface NavbarProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
    leading: ReactNode;
    search?: ReactNode;
    actions?: ReactNode;
    items: Omit<NavigationItemProps, "layout">[];
    navigationLabel?: string;
    layout?: "auto" | "desktop" | "mobile";
}
/** Desktop toolbar and mobile navigation. The consuming shell owns fixed positioning and routes. */
export declare function Navbar({ leading, search, actions, items, navigationLabel, layout, className, ...props }: NavbarProps): import("react").JSX.Element;
export interface NavbarSearchProps extends Omit<ComponentPropsWithRef<"input">, "type" | "size"> {
    label: string;
}
/** Search presentation only. Submit, shortcuts and result handling belong to the consuming form. */
export declare function NavbarSearch({ label, className, ...props }: NavbarSearchProps): import("react").JSX.Element;

// components/NavigationItem.d.ts

import type { ComponentPropsWithRef, ReactNode } from "react";
export interface NavigationItemProps extends Omit<ComponentPropsWithRef<"a">, "children"> {
    label: string;
    /** Supply the approved Bold Duotone icon; activeIcon supplies its Bold counterpart. */
    icon: ReactNode;
    activeIcon: ReactNode;
    active?: boolean;
    layout?: "expanded" | "compact" | "mobile";
}
/** Persistent route selection uses aria-current, independently of press and keyboard focus. */
export declare function NavigationItem({ label, icon, activeIcon, active, layout, className, ...props }: NavigationItemProps): import("react").JSX.Element;
```

## NavigationItem

Public exports: `NavigationItem`, `NavigationItemProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/NavigationItem.tsx)

```ts
// components/NavigationItem.d.ts

import type { ComponentPropsWithRef, ReactNode } from "react";
export interface NavigationItemProps extends Omit<ComponentPropsWithRef<"a">, "children"> {
    label: string;
    /** Supply the approved Bold Duotone icon; activeIcon supplies its Bold counterpart. */
    icon: ReactNode;
    activeIcon: ReactNode;
    active?: boolean;
    layout?: "expanded" | "compact" | "mobile";
}
/** Persistent route selection uses aria-current, independently of press and keyboard focus. */
export declare function NavigationItem({ label, icon, activeIcon, active, layout, className, ...props }: NavigationItemProps): import("react").JSX.Element;
```

## OTPInput

Public exports: `OTPInput`, `OTPInputProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/OTPInput.tsx)

```ts
// components/OTPInput.d.ts

import { type ComponentPropsWithRef } from "react";
import { type FieldProps } from "./internal/Field";
export interface OTPInputProps extends Omit<ComponentPropsWithRef<"input">, "type" | "size" | "children" | "value" | "defaultValue" | "onChange" | "maxLength" | "minLength" | "pattern" | "placeholder">, FieldProps {
    /** Six ASCII digits at most. Keep this a string to preserve leading zeros. */
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}
/**
 * One native input, six decorative cells: a single tab stop and one submitted value.
 * Native selection/deletion stays intact. Completing the code never submits a form.
 */
export declare function OTPInput({ label, hideLabel, helperText, error, id, required, disabled, readOnly, className, ref, value, defaultValue, onValueChange, onPaste, onSelect, onClick, onFocus, autoComplete, inputMode, "aria-describedby": describedBy, ...props }: OTPInputProps): import("react").JSX.Element;

// components/internal/Field.d.ts

import { type ReactNode } from "react";
export interface FieldProps {
    label: string;
    hideLabel?: boolean;
    helperText?: string;
    error?: string;
    id?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}
interface FieldControl {
    id: string;
    "aria-describedby": string | undefined;
}
/** Shared label/message wiring; each control retains its own native semantics. */
export declare function Field({ label, hideLabel, helperText, error, id, required, disabled, className, describedBy, children, labelTone, }: FieldProps & {
    describedBy?: string;
    labelTone?: "primary" | "body";
    children: (control: FieldControl) => ReactNode;
}): import("react").JSX.Element;
export {};
```

## Pagination

Public exports: `Pagination`, `PaginationProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Pagination.tsx)

```ts
// components/Pagination.d.ts

import type { ComponentPropsWithoutRef } from "react";
export interface PaginationProps extends Omit<ComponentPropsWithoutRef<"nav">, "children" | "onChange"> {
    page: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
    previousLabel?: string;
    nextLabel?: string;
    getPageLabel?: (page: number) => string;
    formatRange?: (start: number, end: number, total: number) => string;
}
/** Controlled pagination. The parent loads/slices data; this component never changes the table. */
export declare function Pagination({ page, totalItems, pageSize, onPageChange, disabled, previousLabel, nextLabel, getPageLabel, formatRange, className, "aria-label": label, ...props }: PaginationProps): import("react").JSX.Element;
```

## PasswordInput

Public exports: `PasswordInput`, `PasswordInputProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/PasswordInput.tsx)

```ts
// components/PasswordInput.d.ts

import { type ReactNode } from "react";
import { type InputProps } from "./Input";
export interface PasswordInputProps extends Omit<InputProps, "type"> {
    showPasswordLabel?: string;
    hidePasswordLabel?: string;
    /** Optional decorative artwork for the visibility action; labels always describe its behavior. */
    visibilityIcon?: ReactNode;
}
/** Password value stays in the native input; visibility changes only its type. */
export declare function PasswordInput({ ref, id, disabled, showPasswordLabel, hidePasswordLabel, visibilityIcon, ...props }: PasswordInputProps): import("react").JSX.Element;

// components/Input.d.ts

import type { ComponentPropsWithRef, ReactNode } from "react";
export interface InputProps extends Omit<ComponentPropsWithRef<"input">, "size"> {
    label: string;
    /** Visually hides the label while keeping the input programmatically named. */
    hideLabel?: boolean;
    helperText?: string;
    error?: string;
    size?: "compact" | "standard";
    /** Decorative slots must not contain focusable controls. */
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}
/** Labeled native input; className styles the wrapper and ref reaches the input. */
export declare function Input(props: InputProps): import("react").JSX.Element;
export declare function InputField({ label, hideLabel, helperText, error, size, leftIcon, rightIcon, id, required, disabled, readOnly, className, trailingAction, "aria-describedby": describedBy, ...props }: InputProps & {
    trailingAction?: ReactNode;
}): import("react").JSX.Element;
```

## PasswordRecoveryForm

Public exports: `PasswordRecoveryForm`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/PasswordRecoveryForm.tsx)

```ts
// components/PasswordRecoveryForm.d.ts

import type { PasswordRecoveryFormProps } from "./Auth.types";
/** Requests recovery without revealing whether an account exists. Navigation belongs to the application. */
export declare function PasswordRecoveryForm({ onRequestReset, defaultEmail, error, ...navigation }: PasswordRecoveryFormProps): import("react").JSX.Element;

// components/Auth.types.d.ts

import type { LinkProps } from "./Link";
export interface AuthRequestContext {
    signal: AbortSignal;
}
export interface AuthNavigationProps {
    signInHref: string;
    onBackToSignIn?: LinkProps["onClick"];
}
export interface PasswordRecoveryFormProps extends AuthNavigationProps {
    onRequestReset: (email: string, context: AuthRequestContext) => void | Promise<void>;
    defaultEmail?: string;
    /** Safe application-owned feedback, never raw provider exceptions. */
    error?: string;
}
export interface RecoveryEmailSentProps extends AuthNavigationProps {
    email: string;
    onResend: (context: AuthRequestContext) => void | Promise<void>;
    changeEmailHref: string;
    onChangeEmail?: LinkProps["onClick"];
    /** UI delay after entering the screen and after a successful resend. Server throttling remains authoritative. */
    resendCooldownSeconds?: number;
    error?: string;
}
export interface ResetPasswordFormProps extends AuthNavigationProps {
    onResetPassword: (password: string, context: AuthRequestContext) => void | Promise<void>;
    /** The application validates the reset token; the kit never reads or stores it. */
    tokenStatus?: "valid" | "expired" | "invalid";
    requestResetHref: string;
    onRequestNewLink?: LinkProps["onClick"];
    minimumLength?: number;
    /** Additional client policy; return safe error copy. The server still validates the password. */
    validatePassword?: (password: string) => string | undefined;
    error?: string;
}
export interface TwoStepVerificationFormProps extends AuthNavigationProps {
    /** The application owns the challenge identity, expiry and success navigation. */
    onVerify: (code: string, context: AuthRequestContext) => void | Promise<void>;
    error?: string;
}

// components/Link.d.ts

import type { ComponentPropsWithRef } from "react";
export interface LinkProps extends ComponentPropsWithRef<"a"> {
    /** Removes the destination and activation while preserving the unavailable link label. */
    disabled?: boolean;
}
/** A real navigation link; routers can intercept its native click without losing anchor semantics. */
export declare function Link({ disabled, href, onClick, className, tabIndex, ...props }: LinkProps): import("react").JSX.Element;
```

## Popover

Public exports: `Popover`, `PopoverTrigger`, `PopoverClose`, `PopoverContent`, `PopoverProps`, `PopoverContentProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Popover.tsx)

```ts
// components/Popover.d.ts

import type { ComponentPropsWithRef, ComponentPropsWithoutRef } from "react";
import * as Primitive from "@radix-ui/react-popover";
export type PopoverProps = ComponentPropsWithoutRef<typeof Primitive.Root>;
export type PopoverContentProps = ComponentPropsWithRef<typeof Primitive.Content>;
export declare const Popover: import("react").FC<Primitive.PopoverProps>;
export declare const PopoverTrigger: import("react").ForwardRefExoticComponent<Primitive.PopoverTriggerProps & import("react").RefAttributes<HTMLButtonElement>>;
export declare const PopoverClose: import("react").ForwardRefExoticComponent<Primitive.PopoverCloseProps & import("react").RefAttributes<HTMLButtonElement>>;
/** Interactive contextual content: name the dialog and keep actions reachable by keyboard/touch. */
export declare function PopoverContent({ className, sideOffset, collisionPadding, ...props }: PopoverContentProps): import("react").JSX.Element;
```

## Progress

Public exports: `Progress`, `ProgressProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Progress.tsx)

```ts
// components/Progress.d.ts

import { type ComponentPropsWithoutRef } from "react";
export interface ProgressProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
    label: string;
    /** Omit value for indeterminate work. Data proportions are not rounded to the spacing grid. */
    value?: number;
    max?: number;
    error?: boolean;
    valueLabel?: string;
    workingLabel?: string;
}
/** Values update immediately. The track reveals once; indeterminate decoration loops separately. */
export declare function Progress({ label, value, max, error, valueLabel, workingLabel, className, ...props }: ProgressProps): import("react").JSX.Element;
```

## Radio

Public exports: `Radio`, `RadioProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Radio.tsx)

```ts
// components/Radio.d.ts

import type { ComponentPropsWithRef, ReactNode } from "react";
export interface RadioProps extends Omit<ComponentPropsWithRef<"input">, "type" | "size" | "children"> {
    label: ReactNode;
    hideLabel?: boolean;
}
/** Use a shared name within a fieldset/legend for native exclusive selection and arrow keys. */
export declare function Radio({ label, hideLabel, disabled, className, ...props }: RadioProps): import("react").JSX.Element;
```

## RecoveryEmailSent

Public exports: `RecoveryEmailSent`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/RecoveryEmailSent.tsx)

```ts
// components/RecoveryEmailSent.d.ts

import type { RecoveryEmailSentProps } from "./Auth.types";
/** Inbox guidance and resend action. The timer is a UI affordance, never a rate-limit boundary. */
export declare function RecoveryEmailSent(props: RecoveryEmailSentProps): import("react").JSX.Element;

// components/Auth.types.d.ts

import type { LinkProps } from "./Link";
export interface AuthRequestContext {
    signal: AbortSignal;
}
export interface AuthNavigationProps {
    signInHref: string;
    onBackToSignIn?: LinkProps["onClick"];
}
export interface PasswordRecoveryFormProps extends AuthNavigationProps {
    onRequestReset: (email: string, context: AuthRequestContext) => void | Promise<void>;
    defaultEmail?: string;
    /** Safe application-owned feedback, never raw provider exceptions. */
    error?: string;
}
export interface RecoveryEmailSentProps extends AuthNavigationProps {
    email: string;
    onResend: (context: AuthRequestContext) => void | Promise<void>;
    changeEmailHref: string;
    onChangeEmail?: LinkProps["onClick"];
    /** UI delay after entering the screen and after a successful resend. Server throttling remains authoritative. */
    resendCooldownSeconds?: number;
    error?: string;
}
export interface ResetPasswordFormProps extends AuthNavigationProps {
    onResetPassword: (password: string, context: AuthRequestContext) => void | Promise<void>;
    /** The application validates the reset token; the kit never reads or stores it. */
    tokenStatus?: "valid" | "expired" | "invalid";
    requestResetHref: string;
    onRequestNewLink?: LinkProps["onClick"];
    minimumLength?: number;
    /** Additional client policy; return safe error copy. The server still validates the password. */
    validatePassword?: (password: string) => string | undefined;
    error?: string;
}
export interface TwoStepVerificationFormProps extends AuthNavigationProps {
    /** The application owns the challenge identity, expiry and success navigation. */
    onVerify: (code: string, context: AuthRequestContext) => void | Promise<void>;
    error?: string;
}

// components/Link.d.ts

import type { ComponentPropsWithRef } from "react";
export interface LinkProps extends ComponentPropsWithRef<"a"> {
    /** Removes the destination and activation while preserving the unavailable link label. */
    disabled?: boolean;
}
/** A real navigation link; routers can intercept its native click without losing anchor semantics. */
export declare function Link({ disabled, href, onClick, className, tabIndex, ...props }: LinkProps): import("react").JSX.Element;
```

## ResetPasswordForm

Public exports: `ResetPasswordForm`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/ResetPasswordForm.tsx)

```ts
// components/ResetPasswordForm.d.ts

import type { ResetPasswordFormProps } from "./Auth.types";
/** Applies the displayed client policy; token validity and password acceptance belong to the server. */
export declare function ResetPasswordForm({ onResetPassword, tokenStatus, requestResetHref, onRequestNewLink, minimumLength, validatePassword, error, ...navigation }: ResetPasswordFormProps): import("react").JSX.Element;

// components/Auth.types.d.ts

import type { LinkProps } from "./Link";
export interface AuthRequestContext {
    signal: AbortSignal;
}
export interface AuthNavigationProps {
    signInHref: string;
    onBackToSignIn?: LinkProps["onClick"];
}
export interface PasswordRecoveryFormProps extends AuthNavigationProps {
    onRequestReset: (email: string, context: AuthRequestContext) => void | Promise<void>;
    defaultEmail?: string;
    /** Safe application-owned feedback, never raw provider exceptions. */
    error?: string;
}
export interface RecoveryEmailSentProps extends AuthNavigationProps {
    email: string;
    onResend: (context: AuthRequestContext) => void | Promise<void>;
    changeEmailHref: string;
    onChangeEmail?: LinkProps["onClick"];
    /** UI delay after entering the screen and after a successful resend. Server throttling remains authoritative. */
    resendCooldownSeconds?: number;
    error?: string;
}
export interface ResetPasswordFormProps extends AuthNavigationProps {
    onResetPassword: (password: string, context: AuthRequestContext) => void | Promise<void>;
    /** The application validates the reset token; the kit never reads or stores it. */
    tokenStatus?: "valid" | "expired" | "invalid";
    requestResetHref: string;
    onRequestNewLink?: LinkProps["onClick"];
    minimumLength?: number;
    /** Additional client policy; return safe error copy. The server still validates the password. */
    validatePassword?: (password: string) => string | undefined;
    error?: string;
}
export interface TwoStepVerificationFormProps extends AuthNavigationProps {
    /** The application owns the challenge identity, expiry and success navigation. */
    onVerify: (code: string, context: AuthRequestContext) => void | Promise<void>;
    error?: string;
}

// components/Link.d.ts

import type { ComponentPropsWithRef } from "react";
export interface LinkProps extends ComponentPropsWithRef<"a"> {
    /** Removes the destination and activation while preserving the unavailable link label. */
    disabled?: boolean;
}
/** A real navigation link; routers can intercept its native click without losing anchor semantics. */
export declare function Link({ disabled, href, onClick, className, tabIndex, ...props }: LinkProps): import("react").JSX.Element;
```

## ScrollArea

Public exports: `ScrollArea`, `ScrollAreaViewport`, `ScrollBar`, `ScrollAreaProps`, `ScrollAreaViewportProps`, `ScrollBarProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/ScrollArea.tsx)

```ts
// components/ScrollArea.d.ts

import type { ComponentPropsWithRef } from "react";
import * as Primitive from "@radix-ui/react-scroll-area";
export type ScrollAreaProps = ComponentPropsWithRef<typeof Primitive.Root>;
export type ScrollAreaViewportProps = ComponentPropsWithRef<typeof Primitive.Viewport>;
export type ScrollBarProps = Omit<ComponentPropsWithRef<typeof Primitive.Scrollbar>, "children">;
/** A bounded scroll region with overlay indicators. Give the root a height or width constraint. */
export declare function ScrollArea({ className, type, ...props }: ScrollAreaProps): import("react").JSX.Element;
/** Keep padding on an inner content wrapper so the indicator follows the container edge. */
export declare function ScrollAreaViewport({ className, tabIndex, ...props }: ScrollAreaViewportProps): import("react").JSX.Element;
/** The 4 px thumb sits inside a wider pointer target without reserving a content gutter. */
export declare function ScrollBar({ className, orientation, style, ...props }: ScrollBarProps): import("react").JSX.Element;
```

## Select

Public exports: `Select`, `SelectProps`, `SingleSelectProps`, `MultipleSelectProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Select.tsx)

```ts
// components/Select.d.ts

import type { SelectProps } from "./Select.types";
export type { SelectProps, SingleSelectProps, MultipleSelectProps, } from "./Select.types";
/**
 * An items-only Figma selection menu backed by a native form control.
 * Single selection closes on choice; multiple selection stays open while toggling.
 */
export declare function Select(props: SelectProps): import("react").JSX.Element;

// components/Select.types.d.ts

import type { ComponentPropsWithRef, ReactNode } from "react";
import type { FieldProps } from "./internal/Field";
interface SelectBaseProps extends Omit<ComponentPropsWithRef<"select">, "size" | "multiple" | "value" | "defaultValue">, FieldProps {
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    /** Visible trigger events/ref. The component ref remains the native form select. */
    triggerProps?: Omit<ComponentPropsWithRef<"button">, "children" | "id" | "disabled" | "type" | "role">;
}
export interface SingleSelectProps extends SelectBaseProps {
    multiple?: false;
    value?: string;
    defaultValue?: string;
    /** Receives the submitted string; onChange remains a native select change event. */
    onValueChange?: (value: string) => void;
}
export interface MultipleSelectProps extends SelectBaseProps {
    multiple: true;
    value?: string[];
    defaultValue?: string[];
    /** Displayed only when no options are selected; never rendered inside the popup. */
    placeholder?: string;
    /** Receives selected values in option order. Native forms omit disabled options. */
    onValueChange?: (value: string[]) => void;
}
export type SelectProps = SingleSelectProps | MultipleSelectProps;
export {};

// components/internal/Field.d.ts

import { type ReactNode } from "react";
export interface FieldProps {
    label: string;
    hideLabel?: boolean;
    helperText?: string;
    error?: string;
    id?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}
interface FieldControl {
    id: string;
    "aria-describedby": string | undefined;
}
/** Shared label/message wiring; each control retains its own native semantics. */
export declare function Field({ label, hideLabel, helperText, error, id, required, disabled, className, describedBy, children, labelTone, }: FieldProps & {
    describedBy?: string;
    labelTone?: "primary" | "body";
    children: (control: FieldControl) => ReactNode;
}): import("react").JSX.Element;
export {};
```

## Sidebar

Public exports: `Sidebar`, `SidebarIdentity`, `SidebarProps`, `SidebarIdentityProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Sidebar.tsx)

```ts
// components/Sidebar.d.ts

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { type NavigationItemProps } from "./NavigationItem";
export interface SidebarProps extends Omit<ComponentPropsWithoutRef<"nav">, "children"> {
    brand: ReactNode;
    compactBrand?: ReactNode;
    toggle?: ReactNode;
    workspace: ReactNode;
    account: ReactNode;
    items: Omit<NavigationItemProps, "layout">[];
    footerItems?: Omit<NavigationItemProps, "layout">[];
    groupLabel?: string;
    compact?: boolean;
}
/** A rail, not an overlay. On small screens compose a Drawer around it in the application shell. */
export declare function Sidebar({ brand, compactBrand, toggle, workspace, account, items, footerItems, groupLabel, compact, className, "aria-label": label, ...props }: SidebarProps): import("react").JSX.Element;
export interface SidebarIdentityProps extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
    name: string;
    description?: string;
    initials: string;
    compact?: boolean;
    expandable?: boolean;
}
/** A named workspace/account action. Open a real chooser or account view in onClick. */
export declare function SidebarIdentity({ name, description, initials, compact, expandable, className, type, ...props }: SidebarIdentityProps): import("react").JSX.Element;

// components/NavigationItem.d.ts

import type { ComponentPropsWithRef, ReactNode } from "react";
export interface NavigationItemProps extends Omit<ComponentPropsWithRef<"a">, "children"> {
    label: string;
    /** Supply the approved Bold Duotone icon; activeIcon supplies its Bold counterpart. */
    icon: ReactNode;
    activeIcon: ReactNode;
    active?: boolean;
    layout?: "expanded" | "compact" | "mobile";
}
/** Persistent route selection uses aria-current, independently of press and keyboard focus. */
export declare function NavigationItem({ label, icon, activeIcon, active, layout, className, ...props }: NavigationItemProps): import("react").JSX.Element;
```

## SignInForm

Public exports: `SignInForm`, `SignInFormProps`, `SignInValues`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/SignInForm.tsx)

```ts
// components/SignInForm.d.ts

import { type LinkProps } from "./Link";
export interface SignInValues {
    email: string;
    password: string;
    rememberMe: boolean;
}
export interface SignInFormProps {
    /** Resolve after the application handles the result; reject to show a generic retry message.
     * Never persist credentials here. The application owns sessions, MFA and navigation. */
    onSignIn: (values: SignInValues, context: {
        signal: AbortSignal;
    }) => void | Promise<void>;
    forgotPasswordHref: string;
    onForgotPassword?: LinkProps["onClick"];
    defaultEmail?: string;
    defaultRememberMe?: boolean;
    /** Safe, user-facing provider feedback. Do not pass raw server exceptions. */
    error?: string;
    className?: string;
}
/** Native credential fields with password-manager hints, accessible validation and single-flight submit. */
export declare function SignInForm({ onSignIn, forgotPasswordHref, onForgotPassword, defaultEmail, defaultRememberMe, error, className, }: SignInFormProps): import("react").JSX.Element;

// components/Link.d.ts

import type { ComponentPropsWithRef } from "react";
export interface LinkProps extends ComponentPropsWithRef<"a"> {
    /** Removes the destination and activation while preserving the unavailable link label. */
    disabled?: boolean;
}
/** A real navigation link; routers can intercept its native click without losing anchor semantics. */
export declare function Link({ disabled, href, onClick, className, tabIndex, ...props }: LinkProps): import("react").JSX.Element;
```

## Skeleton

Public exports: `Skeleton`, `SkeletonProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Skeleton.tsx)

```ts
// components/Skeleton.d.ts

import type { ComponentPropsWithoutRef } from "react";
export interface SkeletonProps extends ComponentPropsWithoutRef<"div"> {
    shape?: "row" | "metric" | "card";
    loadingLabel?: string;
    description?: string;
}
/** Decoration is hidden from assistive technology. The containing result region owns aria-busy. */
export declare function Skeleton({ shape, loadingLabel, description, className, ...props }: SkeletonProps): import("react").JSX.Element;
```

## Stepper

Public exports: `Stepper`, `StepperProps`, `StepperStep`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Stepper.tsx)

```ts
// components/Stepper.d.ts

import type { ComponentPropsWithoutRef } from "react";
export interface StepperStep {
    id: string;
    label: string;
    shortLabel?: string;
}
export interface StepperProps extends Omit<ComponentPropsWithoutRef<"ol">, "children"> {
    steps: StepperStep[];
    /** Zero-based active step. A value equal to steps.length marks the entire flow complete. */
    currentStep: number;
    onStepChange?: (index: number) => void;
    getStatusLabel?: (state: "complete" | "current" | "upcoming") => string;
}
/** Ordered progress. Optional buttons revisit completed steps; upcoming steps never bypass validation. */
export declare function Stepper({ steps, currentStep, onStepChange, getStatusLabel, className, "aria-label": label, ...props }: StepperProps): import("react").JSX.Element;
```

## Switch

Public exports: `Switch`, `SwitchProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Switch.tsx)

```ts
// components/Switch.d.ts

import type { ComponentPropsWithRef, ReactNode } from "react";
export interface SwitchProps extends Omit<ComponentPropsWithRef<"input">, "type" | "size" | "children" | "role" | "aria-checked"> {
    label: ReactNode;
    hideLabel?: boolean;
}
/** Native checkbox semantics; CSS moves the thumb without delaying the checked state. */
export declare function Switch({ label, hideLabel, disabled, className, ...props }: SwitchProps): import("react").JSX.Element;
```

## Table

Public exports: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableProps`, `TableRowProps`, `TableHeadProps`, `TableCellProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Table.tsx)

```ts
// components/Table.d.ts

import { type ComponentPropsWithRef, type ReactNode } from "react";
export interface TableProps extends ComponentPropsWithRef<"table"> {
    /** Accessible table name; the scrollable region uses the same name. */
    label: string;
    /** Kept outside horizontal scrolling so empty-state copy remains visible on narrow screens. */
    emptyContent?: ReactNode;
}
/** Native table semantics are retained inside a keyboard-scrollable viewport. */
export declare function Table({ label, children, className, emptyContent, ...props }: TableProps): import("react").JSX.Element;
export declare function TableHeader(props: ComponentPropsWithRef<"thead">): import("react").JSX.Element;
export declare function TableBody(props: ComponentPropsWithRef<"tbody">): import("react").JSX.Element;
export interface TableRowProps extends ComponentPropsWithRef<"tr"> {
    selected?: boolean;
}
export declare function TableRow({ selected, ...props }: TableRowProps): import("react").JSX.Element;
interface IconSlots {
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}
export type TableCellProps = ComponentPropsWithRef<"td"> & IconSlots;
export declare function TableCell({ children, leftIcon, rightIcon, ...props }: TableCellProps): import("react").JSX.Element;
export type TableHeadProps = ComponentPropsWithRef<"th"> & IconSlots;
export declare function TableHead({ children, leftIcon, rightIcon, scope, ...props }: TableHeadProps): import("react").JSX.Element;
export {};
```

## Tabs

Public exports: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `TabsProps`, `TabsListProps`, `TabsTriggerProps`, `TabsContentProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Tabs.tsx)

```ts
// components/Tabs.d.ts

import type { ComponentPropsWithRef, ReactNode } from "react";
import * as Primitive from "@radix-ui/react-tabs";
export type TabsProps = ComponentPropsWithRef<typeof Primitive.Root>;
export type TabsListProps = ComponentPropsWithRef<typeof Primitive.List>;
export interface TabsTriggerProps extends ComponentPropsWithRef<typeof Primitive.Trigger> {
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}
export type TabsContentProps = ComponentPropsWithRef<typeof Primitive.Content>;
/** Panels are activated automatically by default; use manual activation for costly panel loads. */
export declare function Tabs({ className, ...props }: TabsProps): import("react").JSX.Element;
export declare function TabsList({ className, ...props }: TabsListProps): import("react").JSX.Element;
/** With asChild, supply one focusable control that forwards tab props and its ref. */
export declare function TabsTrigger({ asChild, leftIcon, rightIcon, children, className, ...props }: TabsTriggerProps): import("react").JSX.Element;
export declare function TabsContent({ className, ...props }: TabsContentProps): import("react").JSX.Element;
```

## Tag

Public exports: `Tag`, `TagProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Tag.tsx)

```ts
// components/Tag.d.ts

import type { ComponentPropsWithoutRef, ReactNode } from "react";
export interface TagProps extends ComponentPropsWithoutRef<"span"> {
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    disabled?: boolean;
    /** An explicit removal action; the tag label itself never removes a value. */
    onRemove?: () => void;
    removeLabel?: string;
}
/** Selected-value label with optional, separately named removal. Icon slots are decorative. */
export declare function Tag({ children, leftIcon, rightIcon, disabled, onRemove, removeLabel, className, ...props }: TagProps): import("react").JSX.Element;
```

## Textarea

Public exports: `Textarea`, `TextareaProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Textarea.tsx)

```ts
// components/Textarea.d.ts

import type { ComponentPropsWithRef, ReactNode } from "react";
import { type FieldProps } from "./internal/Field";
export interface TextareaProps extends ComponentPropsWithRef<"textarea">, FieldProps {
    /** Decorative content; omitted slots take no layout space. */
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}
/** Native multiline field. Content can grow vertically; manual resizing stays available. */
export declare function Textarea({ label, hideLabel, helperText, error, id, required, disabled, readOnly, className, leftIcon, rightIcon, rows, "aria-describedby": describedBy, ...props }: TextareaProps): import("react").JSX.Element;

// components/internal/Field.d.ts

import { type ReactNode } from "react";
export interface FieldProps {
    label: string;
    hideLabel?: boolean;
    helperText?: string;
    error?: string;
    id?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}
interface FieldControl {
    id: string;
    "aria-describedby": string | undefined;
}
/** Shared label/message wiring; each control retains its own native semantics. */
export declare function Field({ label, hideLabel, helperText, error, id, required, disabled, className, describedBy, children, labelTone, }: FieldProps & {
    describedBy?: string;
    labelTone?: "primary" | "body";
    children: (control: FieldControl) => ReactNode;
}): import("react").JSX.Element;
export {};
```

## TimePicker

Public exports: `TimePicker`, `TimePickerProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/TimePicker.tsx)

```ts
// components/TimePicker.d.ts

import { type PickerFieldProps } from "./internal/PickerField";
export interface TimePickerProps extends PickerFieldProps {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    /** Preferred display format; changing it never changes the HH:mm value. */
    format?: "12h" | "24h";
    allowFormatSwitch?: boolean;
    onFormatChange?: (format: "12h" | "24h") => void;
    minuteStep?: 1 | 5 | 10 | 15 | 20 | 30;
    min?: string;
    max?: string;
    applyLabel?: string;
    cancelLabel?: string;
}
/** Select an hour, then minutes on a clock. Apply is the only operation that commits a time. */
export declare function TimePicker({ value, defaultValue, onValueChange, format, allowFormatSwitch, onFormatChange, minuteStep, min, max, applyLabel, cancelLabel, ...field }: TimePickerProps): import("react").JSX.Element;

// components/internal/PickerField.d.ts

import { type ReactNode, type RefObject, type ComponentPropsWithRef } from "react";
import { type FieldProps } from "./Field";
export interface PickerFieldProps extends FieldProps {
    name?: string;
    form?: string;
    readOnly?: boolean;
    placeholder?: string;
    "aria-describedby"?: string;
    /** Visible button ref and events for focus management and touched-state integration. */
    triggerProps?: Omit<ComponentPropsWithRef<"button">, "children" | "id" | "disabled" | "type" | "role">;
}
/** A button provides the visible control; the native bridge preserves submission and required validation. */
export declare function PickerField({ displayValue, serializedValue, validationMessage, icon, open, onOpenChange, inputRef, children, placeholder, name, form, readOnly, disabled, required, triggerProps, "aria-describedby": describedBy, ...field }: PickerFieldProps & {
    displayValue: string;
    serializedValue: string;
    validationMessage?: string;
    icon: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inputRef: RefObject<HTMLInputElement | null>;
    children: ReactNode;
}): import("react").JSX.Element;

// components/internal/Field.d.ts

import { type ReactNode } from "react";
export interface FieldProps {
    label: string;
    hideLabel?: boolean;
    helperText?: string;
    error?: string;
    id?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}
interface FieldControl {
    id: string;
    "aria-describedby": string | undefined;
}
/** Shared label/message wiring; each control retains its own native semantics. */
export declare function Field({ label, hideLabel, helperText, error, id, required, disabled, className, describedBy, children, labelTone, }: FieldProps & {
    describedBy?: string;
    labelTone?: "primary" | "body";
    children: (control: FieldControl) => ReactNode;
}): import("react").JSX.Element;
export {};
```

## Toast

Public exports: `Toast`, `ToastProvider`, `ToastViewport`, `ToastProps`, `ToastProviderProps`, `ToastViewportProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Toast.tsx)

```ts
// components/Toast.d.ts

import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode } from "react";
import * as Primitive from "@radix-ui/react-toast";
export type ToastProviderProps = ComponentPropsWithoutRef<typeof Primitive.Provider>;
export interface ToastViewportProps extends ComponentPropsWithRef<typeof Primitive.Viewport> {
    inline?: boolean;
    /** Floating notification position. Inline workshop previews ignore this setting. */
    position?: "top-right" | "bottom-right";
}
export interface ToastProps extends Omit<ComponentPropsWithRef<typeof Primitive.Root>, "title" | "children" | "asChild"> {
    title: string;
    description?: ReactNode;
    action?: {
        label: string;
        altText: string;
        onClick: () => void;
    };
    dismissLabel?: string;
    dismissible?: boolean;
    /** Inline keeps actions beside the message at every viewport; stacked uses the shared footer. */
    layout?: "stacked" | "inline";
}
/** One provider/viewport per application notification region. F8 focuses its actions. */
export declare function ToastProvider(props: ToastProviderProps): import("react").JSX.Element;
export declare function ToastViewport({ inline, position, className, ...props }: ToastViewportProps): import("react").JSX.Element;
/** Actionable messages persist by default; compact feedback follows the provider duration. */
export declare function Toast({ title, description, action, dismissLabel, dismissible, layout, duration, type, className, ...props }: ToastProps): import("react").JSX.Element;
```

## Tooltip

Public exports: `Tooltip`, `TooltipProvider`, `TooltipProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Tooltip.tsx)

```ts
// components/Tooltip.d.ts

import type { ComponentPropsWithoutRef, ReactElement } from "react";
import * as Primitive from "@radix-ui/react-tooltip";
export declare const TooltipProvider: import("react").FC<Primitive.TooltipProviderProps>;
export interface TooltipProps extends ComponentPropsWithoutRef<typeof Primitive.Root> {
    children: ReactElement;
    content: string;
    side?: "top" | "right" | "bottom" | "left";
}
/** Supplementary text only. Interactive content belongs in Popover, never role=tooltip. */
export declare function Tooltip({ children, content, side, ...props }: TooltipProps): import("react").JSX.Element;
```

## TwoStepVerificationForm

Public exports: `TwoStepVerificationForm`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/TwoStepVerificationForm.tsx)

```ts
// components/TwoStepVerificationForm.d.ts

import type { TwoStepVerificationFormProps } from "./Auth.types";
/** A six-digit authenticator challenge. Completing or pasting the code never submits automatically. */
export declare function TwoStepVerificationForm({ onVerify, error, ...navigation }: TwoStepVerificationFormProps): import("react").JSX.Element;

// components/Auth.types.d.ts

import type { LinkProps } from "./Link";
export interface AuthRequestContext {
    signal: AbortSignal;
}
export interface AuthNavigationProps {
    signInHref: string;
    onBackToSignIn?: LinkProps["onClick"];
}
export interface PasswordRecoveryFormProps extends AuthNavigationProps {
    onRequestReset: (email: string, context: AuthRequestContext) => void | Promise<void>;
    defaultEmail?: string;
    /** Safe application-owned feedback, never raw provider exceptions. */
    error?: string;
}
export interface RecoveryEmailSentProps extends AuthNavigationProps {
    email: string;
    onResend: (context: AuthRequestContext) => void | Promise<void>;
    changeEmailHref: string;
    onChangeEmail?: LinkProps["onClick"];
    /** UI delay after entering the screen and after a successful resend. Server throttling remains authoritative. */
    resendCooldownSeconds?: number;
    error?: string;
}
export interface ResetPasswordFormProps extends AuthNavigationProps {
    onResetPassword: (password: string, context: AuthRequestContext) => void | Promise<void>;
    /** The application validates the reset token; the kit never reads or stores it. */
    tokenStatus?: "valid" | "expired" | "invalid";
    requestResetHref: string;
    onRequestNewLink?: LinkProps["onClick"];
    minimumLength?: number;
    /** Additional client policy; return safe error copy. The server still validates the password. */
    validatePassword?: (password: string) => string | undefined;
    error?: string;
}
export interface TwoStepVerificationFormProps extends AuthNavigationProps {
    /** The application owns the challenge identity, expiry and success navigation. */
    onVerify: (code: string, context: AuthRequestContext) => void | Promise<void>;
    error?: string;
}

// components/Link.d.ts

import type { ComponentPropsWithRef } from "react";
export interface LinkProps extends ComponentPropsWithRef<"a"> {
    /** Removes the destination and activation while preserving the unavailable link label. */
    disabled?: boolean;
}
/** A real navigation link; routers can intercept its native click without losing anchor semantics. */
export declare function Link({ disabled, href, onClick, className, tabIndex, ...props }: LinkProps): import("react").JSX.Element;
```

## Widget

Public exports: `Widget`, `KPIWidget`, `WidgetProps`, `KPIWidgetProps`. Other declarations below are related module details, not additional root exports.

[Implementation](../src/components/Widget.tsx)

```ts
// components/Widget.d.ts

import { type ReactNode } from "react";
import { type ChartProps } from "./Chart";
export interface WidgetProps {
    title: string;
    description?: string;
    chart: ChartProps;
    /** Compose the existing DropdownMenu or Button here. Actions stay at the right of the header. */
    actions?: ReactNode;
    footer?: ReactNode;
    loading?: boolean;
    loadingLabel?: string;
    error?: ReactNode;
    recovery?: ReactNode;
    headingLevel?: 2 | 3 | 4;
    className?: string;
}
/** Data presentation is independent of fetching; the owner supplies loading, errors and recovery. */
export declare function Widget({ title, description, chart, actions, footer, loading, loadingLabel, error, recovery, headingLevel, className, }: WidgetProps): import("react").JSX.Element;
export interface KPIWidgetProps {
    title: string;
    value: string;
    comparison?: string;
    className?: string;
}
/** Compact approved headline card; comparison is explicit copy rather than an inferred trend. */
export declare function KPIWidget({ title, value, comparison, className, }: KPIWidgetProps): import("react").JSX.Element;

// components/Chart.d.ts

import type { ChartProps } from "./Chart.types";
export type { ChartProps, ChartDatum, ChartMatrixRow, ChartPoint, } from "./Chart.types";
/** Responsive, zero-based visualizations with an always-available semantic data alternative. */
export declare function Chart(props: ChartProps): import("react").JSX.Element;

// components/Chart.types.d.ts

export interface ChartDatum {
    id: string;
    label: string;
    value: number;
}
export interface ChartMatrixRow {
    id: string;
    label: string;
    values: readonly number[];
}
export interface ChartPoint {
    id: string;
    label: string;
    x: number;
    y: number;
}
interface ChartBase {
    label: string;
    /** Animate visual values from zero on first data presentation. Reduced motion always wins. */
    animated?: boolean;
    /** Change this key to replay values without unmounting the chart, axes or data table. */
    animationKey?: string | number;
    description?: string;
    className?: string;
    /** The same data table is always available to assistive technology. */
    showDataTable?: boolean;
    dataTableLabel?: string;
    emptyLabel?: string;
    emptyDescription?: string;
    formatValue?: (value: number) => string;
    categoryLabel?: string;
    valueLabel?: string;
}
interface SeriesChart extends ChartBase {
    type: "line" | "area" | "column" | "histogram" | "horizontal-bar" | "funnel";
    data: readonly ChartDatum[];
    /** Positive zero-based ceiling; must include every value. Auto-derived when omitted. */
    max?: number;
    note?: string;
}
interface MetricChart extends ChartBase {
    type: "metric";
    value: number;
    data: readonly ChartDatum[];
    comparison?: string;
    comparisonTone?: "neutral" | "success" | "danger";
}
interface DonutChart extends ChartBase {
    type: "donut";
    /** At most six parts; zero-valued parts remain in the legend and data table. */
    data: readonly ChartDatum[];
    unit?: string;
}
interface GoalChart extends ChartBase {
    type: "goal";
    value: number;
    max: number;
    target?: number;
    summary?: string;
}
interface StackedChart extends ChartBase {
    type: "stacked-bar";
    /** One to six series. Values are normalized per row; an all-zero row stays empty. */
    series: readonly string[];
    data: readonly ChartMatrixRow[];
}
interface HeatmapChart extends ChartBase {
    type: "heatmap";
    columns: readonly string[];
    data: readonly ChartMatrixRow[];
    max?: number;
    note?: string;
}
interface ScatterChart extends ChartBase {
    type: "scatter";
    data: readonly ChartPoint[];
    xLabel: string;
    yLabel: string;
    xMax?: number;
    yMax?: number;
}
/** Count-based charts accept finite nonnegative values, with unique, nonempty data IDs. */
export type ChartProps = SeriesChart | MetricChart | DonutChart | GoalChart | StackedChart | HeatmapChart | ScatterChart;
export {};
```
