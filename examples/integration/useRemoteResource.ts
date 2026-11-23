import { useEffect, useState } from "react";
import { errorMessage, requestJson } from "./api";

/** URL + revision identifies a request. Aborted and superseded results cannot replace current data. */
export function useRemoteResource<T>(
  url: string,
  decode: (value: unknown) => value is T,
  revision = 0,
) {
  const key = `${url}:${revision}`;
  const [state, setState] = useState<{
    key: string;
    data?: T;
    error?: string;
    loading: boolean;
  }>({ key, loading: true });
  useEffect(() => {
    const controller = new AbortController();
    setState({ key, loading: true });
    requestJson(url, decode, { signal: controller.signal }).then(
      (data) => {
        if (!controller.signal.aborted) setState({ key, data, loading: false });
      },
      (error: unknown) => {
        if (!controller.signal.aborted)
          setState({ key, error: errorMessage(error), loading: false });
      },
    );
    return () => controller.abort();
  }, [url, decode, key]);
  return state.key === key
    ? state
    : { key, loading: true, data: undefined, error: undefined };
}
