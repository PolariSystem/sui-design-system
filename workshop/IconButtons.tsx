import { useState } from "react";
import {
  IconButton,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../src";
import more from "../src/assets/table-more.svg";
import { Example, Section, Specimen } from "./components";

// The original Solar asset acts as a mask so every variant inherits its foreground token.
function MoreIcon() {
  return (
    <span
      className="size-full bg-current"
      style={{ mask: `url("${more}") center / contain no-repeat` }}
    />
  );
}

export function IconButtons() {
  const [message, setMessage] = useState("Choose a record action.");
  return (
    <Section
      name="IconButton"
      description="A single icon action with an accessible name, shared Button states and square geometry."
    >
      <Specimen>
        {(["primary", "secondary", "tertiary", "danger"] as const).map(
          (variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-2">
              <span className="w-24 text-sui-label-md">{variant}</span>
              {(["sm", "md", "lg"] as const).map((size) => (
                <IconButton
                  key={size}
                  variant={variant}
                  size={size}
                  aria-label={`${variant} ${size} actions`}
                  icon={<MoreIcon />}
                />
              ))}
              <IconButton
                variant={variant}
                disabled
                aria-label={`${variant} disabled actions`}
                icon={<MoreIcon />}
              />
              <IconButton
                variant={variant}
                loading
                aria-label={`${variant} pending actions`}
                icon={<MoreIcon />}
              />
            </div>
          ),
        )}
      </Specimen>
      <Example>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton aria-label="Record actions" icon={<MoreIcon />} />
            </DropdownMenuTrigger>
            <DropdownMenuContent aria-label="Record actions">
              <DropdownMenuItem
                onSelect={() =>
                  setMessage("Record duplicated in this preview.")
                }
              >
                Duplicate record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <p role="status">{message}</p>
        </div>
      </Example>
    </Section>
  );
}
