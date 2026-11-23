import { useLayoutEffect, useRef, useState } from "react";

interface AnimationRequest {
  key: string | number | undefined;
  data: string;
  enabled: boolean;
}

/** A native timing effect supplies the shared CSS easing; only decorative marks consume it. */
export function useChartProgress(request: AnimationRequest) {
  const ref = useRef<HTMLDivElement>(null);
  // SSR, missing animation APIs and missing theme styles all render complete data.
  const [progress, setProgress] = useState(1);
  const previous = useRef<AnimationRequest | null>(null);
  const { key, data, enabled } = request;

  useLayoutEffect(() => {
    const prior = previous.current;
    previous.current = { key, data, enabled };
    const element = ref.current;
    // Identical setup may repeat in Strict Mode; changed data alone must not replay.
    const replay =
      !prior || prior.key !== key || prior.data === data || !prior.enabled;
    if (
      !element ||
      !enabled ||
      !replay ||
      !element.animate ||
      !window.matchMedia
    ) {
      setProgress(1);
      return;
    }
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const style = getComputedStyle(element);
    const token = style.getPropertyValue("--sui-motion-duration-slow").trim();
    const duration = parseFloat(token) * (token.endsWith("ms") ? 1 : 1000) * 2;
    if (preference.matches || !Number.isFinite(duration) || duration <= 0) {
      setProgress(1);
      return;
    }
    // Empty keyframes provide the browser's cubic-bezier clock without fading or moving
    // the container. Sampling this clock also lets developer tools pause/seek the reveal.
    const animation = element.animate([{}, {}], {
      id: "sui-chart-values",
      duration,
      easing:
        style.getPropertyValue("--sui-motion-easing-enter").trim() ||
        "ease-out",
      fill: "both",
    });
    let frame = 0;
    setProgress(0);
    const update = () => {
      const value = animation.effect?.getComputedTiming().progress ?? 1;
      setProgress(Math.min(1, Math.max(0, value)));
      if (animation.playState === "running" || animation.playState === "paused")
        frame = requestAnimationFrame(update);
    };
    const reduce = () => {
      if (!preference.matches) return;
      cancelAnimationFrame(frame);
      animation.cancel();
      setProgress(1);
    };
    frame = requestAnimationFrame(update);
    preference.addEventListener("change", reduce);
    return () => {
      cancelAnimationFrame(frame);
      animation.cancel();
      preference.removeEventListener("change", reduce);
    };
  }, [key, data, enabled]);
  return { ref, progress };
}
