import { useRef, useState, type FormEvent } from "react";
import {
  Button,
  CardFooter,
  OTPInput,
  PasswordInput,
  Radio,
  Select,
  Switch,
  Textarea,
} from "../src";
import { Example, Section, Specimen } from "./components";

function DescriptionExample() {
  const [description, setDescription] = useState("");
  return (
    <div className="max-w-lg">
      <Textarea
        label="Workspace description"
        name="description"
        value={description}
        maxLength={280}
        onChange={(event) => setDescription(event.target.value)}
        helperText={`${description.length} / 280 characters`}
        placeholder="Share the purpose of this workspace."
      />
    </div>
  );
}

function CategoryExample() {
  const [category, setCategory] = useState("operations");
  return (
    <div className="flex max-w-lg flex-col gap-4">
      <Select
        label="Record category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      >
        <option value="operations">Operations</option>
        <option value="research">Research</option>
        <option value="finance">Finance</option>
        <option value="archived" disabled>
          Archived (unavailable)
        </option>
      </Select>
      <p role="status" className="text-sui-body-sm text-sui-text-secondary">
        Selected category: {category}.
      </p>
    </div>
  );
}

function TeamsExample() {
  const [teams, setTeams] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  return (
    <form
      className="flex max-w-lg flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(new FormData(event.currentTarget).getAll("teams").map(String));
      }}
      onReset={() => {
        setTeams([]);
        setSaved([]);
      }}
    >
      <Select
        multiple
        label="Workspace teams"
        name="teams"
        placeholder="Select teams"
        value={teams}
        onValueChange={setTeams}
        helperText="Select several teams. Click outside when you are done."
      >
        <optgroup label="Available teams">
          <option value="operations">Operations</option>
          <option value="product">Product</option>
          <option value="support">Support</option>
        </optgroup>
        <option value="archived" disabled>
          Archived (unavailable)
        </option>
      </Select>
      <CardFooter>
        <Button type="submit">Save teams</Button>
        <Button type="reset" variant="secondary">
          Clear teams
        </Button>
      </CardFooter>
      <p role="status" className="text-sui-body-sm text-sui-text-secondary">
        Saved teams: {saved.length ? saved.join(", ") : "none"}. This preview
        does not send data.
      </p>
    </form>
  );
}

function DeliveryExample() {
  const [delivery, setDelivery] = useState("weekly");
  return (
    <fieldset>
      <legend className="mb-4 text-sui-label-md">Report frequency</legend>
      <div className="flex flex-col items-start gap-4">
        {["daily", "weekly", "monthly"].map((value) => (
          <Radio
            key={value}
            label={value[0].toUpperCase() + value.slice(1)}
            name="report-frequency"
            value={value}
            checked={delivery === value}
            onChange={(event) => setDelivery(event.target.value)}
          />
        ))}
        <p role="status" className="text-sui-body-sm text-sui-text-secondary">
          Reports are delivered {delivery}.
        </p>
      </div>
    </fieldset>
  );
}

function NotificationExample() {
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="flex flex-col items-start gap-4">
      <Switch
        label="Email notifications"
        checked={enabled}
        onChange={(event) => setEnabled(event.target.checked)}
      />
      <p role="status" className="text-sui-body-sm text-sui-text-secondary">
        Email notifications are {enabled ? "enabled" : "disabled"} for this
        preview.
      </p>
    </div>
  );
}

function VerificationExample() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.length !== 6) {
      setError("Enter all six digits.");
      input.current?.focus();
      return;
    }
    setError("");
    setSubmitted(true);
  }
  return (
    <form
      noValidate
      onSubmit={submit}
      className="flex max-w-[352px] flex-col gap-4"
      onReset={() => {
        setCode("");
        setError("");
        setSubmitted(false);
      }}
    >
      <OTPInput
        ref={input}
        label="Verification code"
        name="verification-code"
        value={code}
        onValueChange={(value) => {
          setCode(value);
          setError("");
          setSubmitted(false);
        }}
        error={error}
        helperText="Enter or paste the six-digit code."
        required
      />
      <CardFooter>
        <Button type="submit">Continue</Button>
        <Button type="reset" variant="secondary">
          Clear code
        </Button>
      </CardFooter>
      <p role="status" className="text-sui-body-sm text-sui-text-secondary">
        {submitted
          ? "Code captured in this preview. No verification request was sent."
          : "This preview does not verify accounts."}
      </p>
    </form>
  );
}

export function FormControls() {
  return (
    <>
      <Section
        name="Textarea"
        description="Multiline content with labels, validation and vertical growth."
      >
        <Specimen>
          <div className="grid gap-4 md:grid-cols-2">
            <Textarea
              label="Description"
              defaultValue="Set up workspace access and share the resources needed for a smooth start."
              helperText="Add information that helps your team."
            />
            <Textarea
              label="Description error"
              defaultValue="Review"
              error="Add enough detail for your team."
            />
            <Textarea
              label="Description read only"
              defaultValue="Approved workspace description."
              readOnly
            />
            <Textarea
              label="Description disabled"
              defaultValue="Workspace description."
              disabled
            />
          </div>
        </Specimen>
        <Example>
          <DescriptionExample />
        </Example>
      </Section>
      <Section
        name="Select"
        description="Single and multiple selection with items-only dropdowns, keyboard navigation and native form values."
      >
        <Specimen>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Category"
              defaultValue="operations"
              helperText="Choose a category for this record."
            >
              <option value="operations">Operations</option>
              <option value="research">Research</option>
            </Select>
            <Select
              label="Category error"
              defaultValue=""
              error="Choose a category."
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="operations">Operations</option>
            </Select>
            <Select
              label="Category disabled"
              disabled
              defaultValue="operations"
            >
              <option value="operations">Operations</option>
            </Select>
            <Select multiple label="Teams" placeholder="Select teams">
              <option value="operations">Operations</option>
              <option value="product">Product</option>
              <option value="support">Support</option>
            </Select>
            <Select
              multiple
              label="Teams selected"
              defaultValue={["operations", "support"]}
            >
              <option value="operations">Operations</option>
              <option value="product">Product</option>
              <option value="support">Support</option>
            </Select>
            <Select
              multiple
              label="Teams error"
              placeholder="Select teams"
              error="Choose at least one team."
            >
              <option value="operations">Operations</option>
              <option value="product">Product</option>
            </Select>
            <Select
              multiple
              label="Teams disabled"
              disabled
              defaultValue={["operations", "support"]}
            >
              <option value="operations">Operations</option>
              <option value="support">Support</option>
            </Select>
          </div>
        </Specimen>
        <Example>
          <CategoryExample />
        </Example>
        <Example>
          <TeamsExample />
        </Example>
      </Section>
      <Section
        name="Radio"
        description="Exclusive choices, with selection and keyboard focus kept independent."
      >
        <Specimen>
          <div className="flex flex-wrap gap-4">
            <Radio label="Unselected option" name="radio-empty" />
            <Radio
              label="Selected option"
              name="radio-selected"
              defaultChecked
            />
            <Radio label="Disabled option" disabled />
            <Radio label="Selected disabled option" defaultChecked disabled />
          </div>
        </Specimen>
        <Example>
          <DeliveryExample />
        </Example>
      </Section>
      <Section
        name="Switch"
        description="On/off settings with native form participation and an accessible state."
      >
        <Specimen>
          <div className="flex flex-wrap gap-4">
            <Switch label="Off setting" />
            <Switch label="On setting" defaultChecked />
            <Switch label="Disabled setting" disabled />
            <Switch label="On disabled setting" defaultChecked disabled />
          </div>
        </Specimen>
        <Example>
          <NotificationExample />
        </Example>
      </Section>
      <Section
        name="OTPInput"
        description="Six visual cells. One input for keyboard editing, paste and code autofill."
      >
        <Specimen>
          <div className="grid gap-4 md:grid-cols-2">
            <OTPInput label="Empty code" />
            <OTPInput label="Filled code" defaultValue="582041" />
            <OTPInput
              label="Code error"
              defaultValue="582041"
              error="The code has expired."
            />
            <OTPInput label="Code disabled" defaultValue="582041" disabled />
          </div>
        </Specimen>
        <Example>
          <VerificationExample />
        </Example>
      </Section>
      <Section
        name="PasswordInput"
        description="Show or hide a password without changing its value or submitting the form."
      >
        <Specimen>
          <div className="grid gap-4 md:grid-cols-2">
            <PasswordInput
              label="Account password"
              defaultValue="Quiet-river-2026"
              autoComplete="off"
              helperText="Use the visibility control to inspect this example."
            />
            <PasswordInput
              label="Password error"
              defaultValue="short"
              autoComplete="off"
              error="Use at least 12 characters."
            />
            <PasswordInput
              label="Password read only"
              defaultValue="Read-only-example"
              autoComplete="off"
              readOnly
            />
            <PasswordInput
              label="Password disabled"
              defaultValue="Disabled-example"
              autoComplete="off"
              disabled
            />
          </div>
        </Specimen>
        <Example>
          <form
            className="flex max-w-lg flex-col gap-4"
            onSubmit={(event) => event.preventDefault()}
          >
            <PasswordInput
              label="New password"
              name="password"
              autoComplete="new-password"
              minLength={12}
              required
              helperText="Use at least 12 characters. Nothing is stored or sent."
            />
            <CardFooter>
              <Button type="reset" variant="secondary">
                Reset password preview
              </Button>
            </CardFooter>
          </form>
        </Example>
      </Section>
    </>
  );
}
