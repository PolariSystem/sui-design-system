import { useRef, useState } from "react";
import { FileUpload, FileUploadItem } from "@serenity-ui/react";

/** Selection recipe only. Pass these File objects to your application's transport. */
export function AttachmentSelection() {
  const [file, setFile] = useState<File>();
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <FileUpload
        label="Choose a CSV attachment"
        accept=".csv"
        maxSize={1_048_576}
        helperText="CSV · Up to 1 MiB"
        triggerProps={{ ref: trigger }}
        onFilesSelect={([selected]) => setFile(selected)}
      />
      {file && (
        <FileUploadItem
          name={file.name}
          detail={`${file.size} bytes`}
          status="queued"
          onRemove={() => {
            setFile(undefined);
            trigger.current?.focus();
          }}
        />
      )}
    </div>
  );
}
