import { createRef } from "react";
import { test, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUpload, FileUploadItem } from "../src";
import { selectFiles } from "../src/components/internal/file-selection";

test("selection validates extension, MIME, byte limits and counts without losing valid files", () => {
  const csv = new File(["a,b"], "records.CSV");
  const image = new File(["data"], "photo.png", { type: "image/png" });
  const bad = new File(["data"], "run.exe");
  expect(selectFiles([csv, image, bad], ".csv,image/*", 4, 2)).toEqual({
    accepted: [csv, image],
    rejected: [{ file: bad, code: "type" }],
  });
  expect(
    selectFiles([image, csv, csv], "", 3, 1).rejected.map((item) => item.code),
  ).toEqual(["size", "count"]);
});

test("native selection clears for reselection, preserves a ref and announces rejected files", async () => {
  const input = createRef<HTMLInputElement>();
  const accept = vi.fn();
  const reject = vi.fn();
  render(
    <FileUpload
      label="Attachments"
      inputRef={input}
      accept=".csv"
      multiple
      maxFiles={1}
      maxSize={4}
      onFilesSelect={accept}
      onReject={reject}
    />,
  );
  const file = new File(["a,b"], "data.csv");
  const bad = new File(["large"], "large.csv");
  fireEvent.change(input.current!, { target: { files: [file, bad] } });
  expect(accept).toHaveBeenCalledWith([file]);
  expect(reject).toHaveBeenCalledWith([{ file: bad, code: "size" }]);
  expect(screen.getByRole("status")).toHaveTextContent("large.csv");
  expect(input.current!.value).toBe("");
  input.current!.focus();
  expect(screen.getByRole("button", { name: "Attachments" })).toHaveFocus();
  fireEvent.change(input.current!, { target: { files: [file] } });
  expect(accept).toHaveBeenCalledTimes(2);
  expect(screen.getByRole("status")).toHaveTextContent("");
});

test("disabled drop zones reject drops without calling the application", () => {
  const onFilesSelect = vi.fn();
  render(
    <FileUpload label="Attachments" disabled onFilesSelect={onFilesSelect} />,
  );
  fireEvent.drop(screen.getByRole("button"), {
    dataTransfer: { files: [new File(["a"], "a.csv")], types: ["Files"] },
  });
  expect(onFilesSelect).not.toHaveBeenCalled();
});

test("transfer actions are state-specific and 100 percent does not imply server success", async () => {
  const cancel = vi.fn();
  const retry = vi.fn();
  const { rerender } = render(
    <FileUploadItem
      name="records.csv"
      status="uploading"
      progress={100}
      onCancel={cancel}
      onRetry={retry}
    />,
  );
  expect(screen.getByRole("status")).toHaveTextContent("Uploading");
  expect(screen.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Cancel records.csv" }),
  );
  expect(cancel).toHaveBeenCalledOnce();
  rerender(
    <FileUploadItem
      name="records.csv"
      status="error"
      error="Connection lost"
      onCancel={cancel}
      onRetry={retry}
    />,
  );
  expect(screen.queryByRole("progressbar")).toBeNull();
  expect(screen.queryByRole("button", { name: /Cancel/ })).toBeNull();
  await userEvent.click(
    screen.getByRole("button", { name: "Retry records.csv" }),
  );
  expect(retry).toHaveBeenCalledOnce();
});
