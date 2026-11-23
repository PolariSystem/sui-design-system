import { useRef, type KeyboardEvent } from "react";

/** Focus and selection are independent in a multiple listbox; arrows never change values. */
export function useListboxNavigation() {
  const content = useRef<HTMLDivElement>(null);
  const search = useRef({ text: "", time: 0 });
  const items = () =>
    Array.from(
      content.current?.querySelectorAll<HTMLElement>(
        '[role="option"]:not([aria-disabled="true"])',
      ) ?? [],
    );
  const focus = (item?: HTMLElement) => {
    item?.focus({ preventScroll: true });
    item?.scrollIntoView({ block: "nearest" });
  };

  function focusInitial(edge?: "first" | "last") {
    search.current = { text: "", time: 0 };
    const options = items();
    const selected = options.find(
      (item) => item.getAttribute("aria-selected") === "true",
    );
    focus(
      edge === "last"
        ? options.at(-1)
        : edge === "first"
          ? options[0]
          : (selected ?? options[0]),
    );
    if (!options.length) content.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.nativeEvent.isComposing) return;
    const options = items();
    const index = options.indexOf(document.activeElement as HTMLElement);
    let target: HTMLElement | undefined;
    switch (event.key) {
      case "ArrowDown":
        target = options[Math.min(index + 1, options.length - 1)];
        break;
      case "ArrowUp":
        target = options[Math.max(index - 1, 0)];
        break;
      case "Home":
        target = options[0];
        break;
      case "End":
        target = options.at(-1);
        break;
      default: {
        if (
          event.key.length !== 1 ||
          event.key === " " ||
          event.ctrlKey ||
          event.altKey ||
          event.metaKey
        )
          return;
        const now = Date.now();
        const text =
          (now - search.current.time < 700 ? search.current.text : "") +
          event.key.toLocaleLowerCase();
        search.current = { text, time: now };
        // Repeated letters cycle matching options; a word continues matching the current one.
        const query = [...text].every((letter) => letter === text[0])
          ? text[0]
          : text;
        const start = query.length === 1 ? index + 1 : Math.max(index, 0);
        target = [...options.slice(start), ...options.slice(0, start)].find(
          (item) =>
            item.textContent?.trim().toLocaleLowerCase().startsWith(query),
        );
      }
    }
    event.preventDefault();
    focus(target);
  }

  return { content, focusInitial, onKeyDown };
}
