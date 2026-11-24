export interface UploadReceipt {
  id: string;
  name: string;
  size: number;
  sha256: string;
}

/** XHR exposes request-body progress. Completion requires a successful, validated server response. */
export function uploadFile(
  file: File,
  signal: AbortSignal,
  onProgress: (percent: number | undefined) => void,
): Promise<UploadReceipt> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    const cleanup = () => signal.removeEventListener("abort", abort);
    if (signal.aborted) {
      reject(new DOMException("Upload cancelled", "AbortError"));
      return;
    }
    xhr.upload.onprogress = (event) =>
      onProgress(
        event.lengthComputable
          ? Math.round((event.loaded / event.total) * 100)
          : undefined,
      );
    xhr.onload = () => {
      cleanup();
      let result: unknown;
      try {
        result = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("The upload service returned an invalid response."));
        return;
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(
          new Error(
            typeof result === "object" &&
              result !== null &&
              "message" in result &&
              typeof result.message === "string"
              ? result.message
              : "Upload failed. Try again.",
          ),
        );
        return;
      }
      if (
        typeof result !== "object" ||
        result === null ||
        !("id" in result) ||
        typeof result.id !== "string" ||
        !result.id ||
        !("name" in result) ||
        result.name !== file.name ||
        !("size" in result) ||
        result.size !== file.size ||
        !("sha256" in result) ||
        typeof result.sha256 !== "string" ||
        !/^[a-f0-9]{64}$/i.test(result.sha256)
      ) {
        reject(new Error("The upload receipt is invalid."));
        return;
      }
      resolve(result as UploadReceipt);
    };
    xhr.onerror = () => {
      cleanup();
      reject(new Error("Connection lost. Retry the upload."));
    };
    xhr.ontimeout = () => {
      cleanup();
      reject(new Error("Upload timed out. Try again."));
    };
    xhr.onabort = () => {
      cleanup();
      reject(new DOMException("Upload cancelled", "AbortError"));
    };
    xhr.open(
      "POST",
      `/api/uploads?${new URLSearchParams({ name: file.name })}`,
    );
    xhr.timeout = 60_000;
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    signal.addEventListener("abort", abort, { once: true });
    xhr.send(file);
  });
}
