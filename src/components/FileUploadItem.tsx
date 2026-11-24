import type { ComponentPropsWithRef } from "react";
import { Button } from "./Button";
import { Progress } from "./Progress";
import { AssetIcon } from "./internal/AssetIcon";
import fileIcon from "../assets/upload-file.svg";

export type FileUploadStatus =
  "queued" | "uploading" | "success" | "error" | "cancelled";
export interface FileUploadItemProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
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
const labels: Record<FileUploadStatus, string> = {
  queued: "Ready to upload",
  uploading: "Uploading",
  success: "Uploaded",
  error: "Upload failed",
  cancelled: "Upload cancelled",
};

/** A controlled transfer row. Status changes and cancellation are owned by the application. */
export function FileUploadItem({
  name,
  detail,
  status,
  progress,
  statusLabel = labels[status],
  error,
  disabled,
  onCancel,
  onRetry,
  onRemove,
  cancelLabel = "Cancel",
  retryLabel = "Retry",
  removeLabel = "Remove",
  progressLabel = "Uploading file",
  className = "",
  ...props
}: FileUploadItemProps) {
  const transferAction =
    status === "uploading"
      ? onCancel && { label: cancelLabel, run: onCancel }
      : (status === "error" || status === "cancelled") && onRetry
        ? { label: retryLabel, run: onRetry }
        : undefined;
  const removeAction =
    status !== "uploading" && onRemove
      ? { label: removeLabel, run: onRemove }
      : undefined;
  // Keep the first action node stable across Cancel → Retry → Cancel so keyboard
  // focus survives controlled state transitions. Row removal remains owner-managed.
  const actions = [transferAction, removeAction].filter(
    (action) => action !== undefined,
  );
  return (
    <div
      {...props}
      className={`sui-file-upload-item min-w-0 font-sui ${className}`}
      data-status={status}
    >
      <div className="sui-file-upload-row rounded-sui-md bg-sui-surface-canvas p-4">
        <AssetIcon
          src={fileIcon}
          size={28}
          className="text-sui-icon-secondary"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="break-words text-sui-heading-xs text-sui-text-body">
            {name}
          </p>
          {detail && (
            <p className="break-words text-sui-caption-md text-sui-text-secondary">
              {detail}
            </p>
          )}
          <p
            role="status"
            aria-atomic="true"
            className={`break-words text-sui-caption-md ${status === "error" ? "text-sui-status-danger-foreground" : "text-sui-text-secondary"}`}
          >
            {error || statusLabel}
          </p>
          {status === "uploading" && (
            <Progress
              label={progressLabel}
              aria-label={`${progressLabel}: ${name}`}
              value={progress}
            />
          )}
        </div>
        {actions.length > 0 && (
          <div className="sui-file-upload-actions flex flex-wrap justify-end gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="secondary"
                disabled={disabled}
                onClick={action.run}
                aria-label={`${action.label} ${name}`}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
