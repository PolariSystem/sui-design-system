import {
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type Ref,
} from "react";
import { AssetIcon } from "./internal/AssetIcon";
import { useControlRef } from "./internal/useControlRef";
import { selectFiles, type FileRejection } from "./internal/file-selection";
import folder from "../assets/upload-folder.svg";

export type {
  FileRejection,
  FileRejectionCode,
} from "./internal/file-selection";
export interface FileUploadProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children" | "onDrop" | "onDragEnter" | "onDragLeave" | "onDragOver"
> {
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
  triggerProps?: Omit<
    ComponentPropsWithRef<"button">,
    "children" | "type" | "disabled"
  >;
}
const messages = {
  type: "This file type is not accepted.",
  size: "This file exceeds the size limit.",
  count: "The selection exceeds the file limit.",
};

/**
 * Selection only: accepted File objects are delivered to the application, never uploaded here.
 * The native picker resets after selection so the same file can be retried. Submit files through
 * application-owned FormData; this control deliberately does not serialize a form field.
 */
export function FileUpload({
  label,
  helperText,
  error,
  accept = "",
  multiple = false,
  maxSize = Infinity,
  maxFiles = Infinity,
  disabled = false,
  browseLabel = "Drop files here or browse files",
  dropLabel = "Release to select your files",
  disabledLabel = "Uploads are currently unavailable",
  errorLabel = "We could not select these files",
  onFilesSelect,
  onReject,
  rejectionMessage = ({ file, code }) => `${file.name}: ${messages[code]}`,
  inputRef,
  triggerProps,
  className = "",
  ...props
}: FileUploadProps) {
  if (
    !(maxSize >= 0) ||
    !(maxFiles > 0) ||
    (maxFiles !== Infinity && !Number.isInteger(maxFiles))
  )
    throw new RangeError(
      "FileUpload limits must be nonnegative bytes and a positive integer file count.",
    );
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const ref = useControlRef(input, inputRef);
  const triggerRef = useControlRef(trigger, triggerProps?.ref);
  const depth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [feedback, setFeedback] = useState("");
  function select(files: File[]) {
    if (disabled || !files.length) return;
    const result = selectFiles(files, accept, maxSize, multiple ? maxFiles : 1);
    setFeedback(result.rejected.map(rejectionMessage).join(" "));
    if (result.rejected.length) onReject?.(result.rejected);
    if (result.accepted.length) onFilesSelect(result.accepted);
  }
  const message = error || feedback;
  const description =
    [
      helperText && !message ? `${id}-help` : "",
      message ? `${id}-error` : "",
      triggerProps?.["aria-describedby"],
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div
      {...props}
      className={`sui-file-upload flex min-w-0 flex-col gap-2 font-sui ${className}`}
      onDragEnter={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        depth.current += 1;
        if (!disabled) setDragging(true);
      }}
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = disabled ? "none" : "copy";
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        depth.current = Math.max(0, depth.current - 1);
        if (!depth.current) setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        depth.current = 0;
        setDragging(false);
        select(Array.from(event.dataTransfer.files));
      }}
    >
      <input
        ref={ref}
        type="file"
        accept={accept || undefined}
        multiple={multiple}
        disabled={disabled}
        aria-label={label}
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
        onFocus={() => trigger.current?.focus()}
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          event.currentTarget.value = "";
          select(files);
        }}
      />
      <button
        {...triggerProps}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={triggerProps?.["aria-label"] ?? label}
        aria-describedby={description}
        aria-invalid={Boolean(message) || undefined}
        data-dragging={dragging && !disabled}
        data-error={Boolean(message)}
        className={`sui-file-upload-drop flex w-full min-w-0 flex-col items-center gap-2 rounded-sui-md bg-sui-surface-canvas p-5 text-center text-sui-text-body disabled:cursor-not-allowed disabled:opacity-(--sui-opacity-disabled) ${triggerProps?.className ?? ""}`}
        onClick={(event) => {
          triggerProps?.onClick?.(event);
          if (!event.defaultPrevented) input.current?.click();
        }}
      >
        <AssetIcon src={folder} size={24} className="text-sui-icon-secondary" />
        <span className="w-full break-words text-sui-label-md">
          {disabled
            ? disabledLabel
            : dragging
              ? dropLabel
              : message
                ? errorLabel
                : browseLabel}
        </span>
        {helperText && !message && (
          <span
            id={`${id}-help`}
            className="w-full break-words text-sui-caption-md text-sui-text-secondary"
          >
            {helperText}
          </span>
        )}
        {message && (
          <span
            id={`${id}-error`}
            className="w-full break-words text-sui-caption-md text-sui-status-danger-foreground"
          >
            {message}
          </span>
        )}
      </button>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {message}
      </div>
    </div>
  );
}
