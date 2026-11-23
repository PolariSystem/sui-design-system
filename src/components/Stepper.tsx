import type { ComponentPropsWithoutRef } from "react";

export interface StepperStep {
  id: string;
  label: string;
  shortLabel?: string;
}
export interface StepperProps extends Omit<
  ComponentPropsWithoutRef<"ol">,
  "children"
> {
  steps: StepperStep[];
  /** Zero-based active step. A value equal to steps.length marks the entire flow complete. */
  currentStep: number;
  onStepChange?: (index: number) => void;
  getStatusLabel?: (state: "complete" | "current" | "upcoming") => string;
}

/** Ordered progress. Optional buttons revisit completed steps; upcoming steps never bypass validation. */
export function Stepper({
  steps,
  currentStep,
  onStepChange,
  getStatusLabel = (state) =>
    ({ complete: "Completed", current: "Current step", upcoming: "Upcoming" })[
      state
    ],
  className = "",
  "aria-label": label = "Progress steps",
  ...props
}: StepperProps) {
  const current = Number.isFinite(currentStep)
    ? Math.max(0, Math.min(steps.length, Math.floor(currentStep)))
    : 0;
  return (
    <ol
      {...props}
      aria-label={label}
      className={`sui-stepper flex min-w-0 gap-4 rounded-sui-card bg-sui-surface-canvas p-4 font-sui ${className}`}
    >
      {steps.map((step, index) => {
        const state =
          index < current
            ? "complete"
            : index === current
              ? "current"
              : "upcoming";
        const content = (
          <>
            <span
              aria-hidden="true"
              className="sui-step-indicator flex size-6 shrink-0 items-center justify-center rounded-sui-card text-sui-label-sm"
            >
              {index + 1}
            </span>
            <span className="min-w-0 break-words">
              <span className={step.shortLabel ? "sui-step-full-label" : ""}>
                {step.label}
              </span>
              {step.shortLabel && (
                <span className="sui-step-short-label" aria-hidden="true">
                  {step.shortLabel}
                </span>
              )}
              <span className="sr-only"> — {getStatusLabel(state)}</span>
            </span>
          </>
        );
        return (
          <li
            key={step.id}
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
            className="sui-step min-w-0 flex-1"
          >
            {onStepChange && state === "complete" ? (
              <button
                type="button"
                onClick={() => onStepChange(index)}
                className="sui-step-content flex w-full items-center gap-2 rounded-sui-xs text-start focus-visible:outline-2 focus-visible:outline-sui-border-focus"
              >
                {content}
              </button>
            ) : (
              <span className="sui-step-content flex items-center gap-2">
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
