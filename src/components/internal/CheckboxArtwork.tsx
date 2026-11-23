import unread from "../../assets/unread-bold.svg";
import unreadDisabled from "../../assets/unread-bold-disabled.svg";
import tableUnread from "../../assets/table-unread.svg";

/** Shared decorative layers. Native Checkbox and listbox options own their semantics. */
export function CheckboxArtwork({
  disabled,
  size = 20,
}: {
  disabled?: boolean;
  size?: 16 | 20;
}) {
  return (
    <>
      <span
        aria-hidden="true"
        className="sui-checkbox-box absolute inset-0 rounded-sui-xs border border-sui-border-control bg-sui-surface-default peer-enabled:peer-hover:border-sui-border-hover peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sui-border-focus peer-disabled:bg-sui-surface-disabled"
      />
      <img
        aria-hidden="true"
        alt=""
        src={size === 16 ? tableUnread : disabled ? unreadDisabled : unread}
        style={
          size === 16 && disabled
            ? { filter: "opacity(var(--sui-opacity-disabled))" }
            : undefined
        }
        className="sui-checkmark pointer-events-none absolute inset-0 opacity-0 peer-checked:opacity-100"
      />
      <span
        aria-hidden="true"
        className="sui-mixed pointer-events-none absolute inset-0 flex opacity-0 items-center justify-center rounded-sui-xs bg-sui-action-primary-default peer-indeterminate:opacity-100 peer-disabled:bg-sui-surface-disabled"
      >
        <span
          className={`h-1 w-2 rounded-sui-xs ${disabled ? "bg-sui-icon-disabled" : "bg-sui-icon-inverse"}`}
        />
      </span>
    </>
  );
}
