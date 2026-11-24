import { useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Switch,
  Dialog,
  DialogTrigger,
  DialogContent,
} from "../src";
import { Section } from "./components";

function MotionExamples() {
  const [cycle, setCycle] = useState(0);
  return (
    <>
      <Card padding="comfortable" className="motion-intro">
        <span className="text-sui-label-md text-sui-text-link">
          SERENITY / MOTION
        </span>
        <h2 className="text-sui-heading-lg">
          A little movement.
          <br />A clearer response.
        </h2>
        <p className="max-w-xl text-sui-body-lg text-sui-text-secondary">
          Quick to respond, gentle to settle. Movement helps you feel what
          changed, without interrupting what you came to do.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => setCycle((value) => value + 1)}>
            Play motion study
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Open a panel</Button>
            </DialogTrigger>
            <DialogContent
              title="Space to focus"
              description="A short entrance, a softer landing. Dismiss with Escape or the close button."
            >
              <p>Focus and interactions are available immediately.</p>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
      <div className="motion-studies" key={cycle}>
        {[
          [
            "Respond",
            "120 ms",
            "A brief press confirms your action.",
            "respond",
          ],
          [
            "Settle",
            "240 ms",
            "Controls move confidently into their next state.",
            "settle",
          ],
          [
            "Reveal",
            "800 ms",
            "Surfaces enter in 800 ms; sections and reading content use a gradual 1,600 ms entrance.",
            "reveal",
          ],
        ].map(([name, duration, description, kind]) => (
          <Card key={name} padding="comfortable">
            <div
              className={`motion-stage motion-stage-${kind}`}
              aria-hidden="true"
            >
              <span />
            </div>
            <h2 className="text-sui-heading-xs">
              {name}{" "}
              <span className="text-sui-caption-md text-sui-text-secondary">
                {duration}
              </span>
            </h2>
            <p className="text-sui-body-md text-sui-text-secondary">
              {description}
            </p>
          </Card>
        ))}
      </div>
      <Card padding="comfortable">
        <h2 className="text-sui-heading-xs">Try the details</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Switch label="Enable notifications" defaultChecked />
          <Checkbox label="Keep me updated" />
          <Button variant="secondary">Press and release</Button>
        </div>
        <p className="mt-4 text-sui-body-sm text-sui-text-secondary">
          Your system’s reduced-motion setting is respected throughout the
          library. No bounce, parallax or delayed feedback.
        </p>
      </Card>
    </>
  );
}

export function MotionPage() {
  return (
    <Section
      name="Motion"
      description="A shared rhythm for every Serenity interaction."
    >
      <MotionExamples />
    </Section>
  );
}
