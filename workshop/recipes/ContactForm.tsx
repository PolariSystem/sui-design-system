import { useState, type FormEvent } from "react";
import { Button, Card, CardFooter, Input } from "@serenity-ui/react";

export interface ContactValues {
  email: string;
}
export type ContactResult = { ok: true } | { ok: false; emailError: string };

/** The application supplies persistence and maps its service errors to this contract. */
export function ContactForm({
  save,
}: {
  save: (values: ContactValues) => Promise<ContactResult>;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();
    setPending(true);
    setError("");
    setMessage("");
    try {
      const result = await save({ email });
      if (result.ok) setMessage("Contact saved.");
      else {
        setError(result.emailError);
        // Keep focus on the actionable field after server validation fails.
        (form.elements.namedItem("email") as HTMLInputElement | null)?.focus();
      }
    } catch {
      setMessage("Could not save. Your input is preserved; please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} aria-busy={pending}>
      <Card>
        <Input
          label="Contact email"
          name="email"
          type="email"
          autoComplete="email"
          required
          readOnly={pending}
          error={error}
          onChange={() => setError("")}
        />
        <p role="status" className="text-sui-body-sm">
          {message}
        </p>
        <CardFooter>
          <Button type="submit" loading={pending}>
            Save contact
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
