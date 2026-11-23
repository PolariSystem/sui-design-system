import { useMemo, type Ref, type RefCallback, type RefObject } from "react";

/** Share a native control with consumers, preserving React 19 callback-ref cleanup. */
export function useControlRef<T>(
  internal: RefObject<T | null>,
  external: Ref<T> | undefined,
): RefCallback<T> {
  return useMemo(
    () => (node: T | null) => {
      internal.current = node;
      const cleanup =
        typeof external === "function" ? external(node) : undefined;
      if (external && typeof external !== "function") external.current = node;
      return () => {
        internal.current = null;
        if (typeof cleanup === "function") cleanup();
        else if (typeof external === "function") external(null);
        else if (external) external.current = null;
      };
    },
    [internal, external],
  );
}
