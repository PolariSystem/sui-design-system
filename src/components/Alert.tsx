import { AssetIcon } from "./internal/AssetIcon";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import info from "../assets/status-info.svg";
import success from "../assets/status-success.svg";
import warning from "../assets/status-warning.svg";
import danger from "../assets/status-danger.svg";

export interface AlertProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "title"
> {
  title: ReactNode;
  tone?: "info" | "success" | "warning" | "danger";
  /** Opt into live announcements only for newly arriving messages. Static guidance stays quiet. */
  announcement?: "off" | "polite" | "assertive";
}
const tones = {
  info: {
    icon: info,
    classes: "bg-sui-status-info-background text-sui-status-info-foreground",
  },
  success: {
    icon: success,
    classes:
      "bg-sui-status-success-background text-sui-status-success-foreground",
  },
  warning: {
    icon: warning,
    classes:
      "bg-sui-status-warning-background text-sui-status-warning-foreground",
  },
  danger: {
    icon: danger,
    classes:
      "bg-sui-status-danger-background text-sui-status-danger-foreground",
  },
};

/** Inline feedback pairs its semantic tone with explicit text; it never clears field values. */
export function Alert({
  title,
  tone = "info",
  announcement = "off",
  children,
  className = "",
  ...props
}: AlertProps) {
  return (
    <div
      role={
        announcement === "assertive"
          ? "alert"
          : announcement === "polite"
            ? "status"
            : undefined
      }
      {...props}
      className={`sui-alert flex min-w-0 items-start gap-3 rounded-sui-control p-4 font-sui ${tones[tone].classes} ${className}`}
    >
      <AssetIcon src={tones[tone].icon} />
      <div className="flex min-w-0 flex-1 flex-col gap-1 break-words">
        <p className="text-sui-label-lg">{title}</p>
        {children && <div className="text-sui-body-sm">{children}</div>}
      </div>
    </div>
  );
}
