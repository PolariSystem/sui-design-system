import { useEffect, useRef, useState } from "react";
import {
  Button,
  CardFooter,
  FileUpload,
  FileUploadItem,
  type FileUploadStatus,
} from "../src";
import { Example, Section, Specimen } from "./components";
function UploadExample() {
  const [file, setFile] = useState<File>();
  const [status, setStatus] = useState<FileUploadStatus>("queued");
  const [progress, setProgress] = useState(0);
  const picker = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const stop = () => clearInterval(timer.current);
  useEffect(() => stop, []);
  function start() {
    stop();
    setProgress(0);
    setStatus("uploading");
    let value = 0;
    timer.current = setInterval(() => {
      value += 10;
      setProgress(value);
      if (value >= 100) {
        stop();
        setStatus("success");
      }
    }, 240);
  }
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <p className="text-sui-body-sm text-sui-text-secondary">
        Simulated transfer; files stay in this browser. The HTTP integration
        example sends real requests.
      </p>
      <FileUpload
        label="Choose a sample attachment"
        triggerProps={{ ref: picker }}
        accept=".csv,.pdf,.png,.jpg"
        maxSize={10_485_760}
        disabled={status === "uploading"}
        helperText="CSV, PDF, PNG or JPG · Up to 10 MiB"
        onFilesSelect={(files) => {
          stop();
          setFile(files[0]);
          setStatus("queued");
          setProgress(0);
        }}
      />
      {file && (
        <FileUploadItem
          name={file.name}
          detail={`${file.size.toLocaleString("en-US")} bytes`}
          status={status}
          progress={progress}
          onCancel={() => {
            stop();
            setStatus("cancelled");
          }}
          onRetry={start}
          onRemove={() => {
            stop();
            setFile(undefined);
            setStatus("queued");
            picker.current?.focus();
          }}
        />
      )}
      <CardFooter>
        <Button
          disabled={!file || status === "uploading" || status === "success"}
          onClick={start}
        >
          Upload sample
        </Button>
        <Button
          variant="secondary"
          disabled={status !== "uploading"}
          onClick={() => {
            stop();
            setStatus("error");
          }}
        >
          Simulate interruption
        </Button>
      </CardFooter>
    </div>
  );
}
export function FileUploads() {
  return (
    <Section
      name="FileUpload"
      description="Accessible file selection and controlled transfer feedback, connected to your own service."
    >
      <Specimen>
        <FileUpload
          label="Browse files specimen"
          helperText="CSV, PDF, PNG or JPG · Up to 10 MiB each"
          onFilesSelect={() => {}}
        />
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          <FileUploadItem
            name="workspace-records.csv"
            detail="128 KB"
            status="queued"
            onRemove={() => {}}
          />
          <FileUploadItem
            name="workspace-records.csv"
            detail="128 KB"
            status="uploading"
            progress={50}
            onCancel={() => {}}
          />
          <FileUploadItem
            name="workspace-records.csv"
            detail="128 KB"
            status="success"
          />
          <FileUploadItem
            name="workspace-records.csv"
            detail="128 KB"
            status="error"
            error="Connection lost. Retry the upload."
            onRetry={() => {}}
          />
        </div>
        <FileUpload
          label="Unavailable upload specimen"
          disabled
          helperText="CSV, PDF, PNG or JPG · Up to 10 MiB each"
          onFilesSelect={() => {}}
        />
      </Specimen>
      <Example>
        <UploadExample />
      </Example>
    </Section>
  );
}
