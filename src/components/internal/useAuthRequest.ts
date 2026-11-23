import { useEffect, useRef, useState } from "react";
import type { AuthRequestContext } from "../Auth.types";

/** Shared single-flight lifecycle. Aborted or stale requests cannot publish feedback. */
export function useAuthRequest(failureMessage: string, scope?: string) {
  const active = useRef<AbortController | null>(null);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState("");
  useEffect(() => {
    setPending(false);
    setFailure("");
    return () => {
      active.current?.abort();
      active.current = null;
    };
  }, [scope]);
  async function run(
    action: (context: AuthRequestContext) => void | Promise<void>,
  ) {
    if (active.current) return false;
    const controller = new AbortController();
    active.current = controller;
    setPending(true);
    setFailure("");
    try {
      await action({ signal: controller.signal });
      return !controller.signal.aborted;
    } catch {
      if (!controller.signal.aborted) setFailure(failureMessage);
      return false;
    } finally {
      if (active.current === controller) {
        active.current = null;
        setPending(false);
      }
    }
  }
  return { pending, failure, run, clearFailure: () => setFailure("") };
}
