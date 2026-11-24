import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContactForm } from "../workshop/recipes/ContactForm";

describe("documented contact form contract", () => {
  it("maps server validation, preserves input, focuses the field and allows retry", async () => {
    const save = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        emailError: "This contact already exists.",
      })
      .mockResolvedValueOnce({ ok: true });
    render(<ContactForm save={save} />);
    const email = screen.getByRole("textbox", { name: "Contact email" });
    fireEvent.change(email, { target: { value: "ada@example.com" } });
    fireEvent.submit(email.closest("form")!);
    await waitFor(() => expect(email).toHaveAttribute("aria-invalid", "true"));
    expect(email).toHaveFocus();
    expect(email).toHaveValue("ada@example.com");
    expect(save).toHaveBeenCalledWith({ email: "ada@example.com" });
    fireEvent.change(email, { target: { value: "new@example.com" } });
    fireEvent.submit(email.closest("form")!);
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Contact saved."),
    );
  });
  it("recovers from transport rejection without clearing the form", async () => {
    render(
      <ContactForm
        save={async () => {
          throw new Error("Offline");
        }}
      />,
    );
    const email = screen.getByRole("textbox", { name: "Contact email" });
    fireEvent.change(email, { target: { value: "ada@example.com" } });
    fireEvent.submit(email.closest("form")!);
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Could not save."),
    );
    expect(email).toHaveValue("ada@example.com");
    expect(screen.getByRole("button", { name: "Save contact" })).toBeEnabled();
  });
});
