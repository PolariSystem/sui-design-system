import { useId, useState } from "react";
import type { DashboardSize } from "../Dashboard.types";
import { Button } from "../Button";
import { CardFooter } from "../Card";
import { Dialog, DialogContent, DialogTrigger } from "../Dialog";
import { Radio } from "../Radio";
import settingsIcon from "../../assets/dashboard-settings.svg";
const sizeNames = { S: "Small", M: "Medium", L: "Large" };

export function DashboardWidgetSettings({
  title,
  size,
  sizes,
  onSizeChange,
  compact = false,
}: {
  title: string;
  size: DashboardSize;
  sizes: readonly DashboardSize[];
  onSizeChange: (size: DashboardSize) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(size);
  const radioName = useId();
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(size);
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant={compact ? "tertiary" : "secondary"}
          iconOnly={compact}
          aria-label={compact ? "Settings" : undefined}
          leftIcon={compact ? undefined : <img src={settingsIcon} alt="" />}
        >
          {compact ? <img src={settingsIcon} alt="" /> : "Settings"}
        </Button>
      </DialogTrigger>
      <DialogContent
        title={`${title} settings`}
        description="Choose the width on larger screens. Every widget uses the full available width on mobile."
        footer={
          <CardFooter>
            <Button
              onClick={() => {
                onSizeChange(draft);
                setOpen(false);
              }}
            >
              Apply size
            </Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </CardFooter>
        }
      >
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sui-label-md">Widget size</legend>
          {sizes.map((option) => (
            <Radio
              key={option}
              name={radioName}
              value={option}
              label={`${sizeNames[option]} (${option})`}
              checked={draft === option}
              onChange={() => setDraft(option)}
            />
          ))}
        </fieldset>
      </DialogContent>
    </Dialog>
  );
}
