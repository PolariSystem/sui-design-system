export type FileRejectionCode = "type" | "size" | "count";
export interface FileRejection {
  file: File;
  code: FileRejectionCode;
}

/** Browser accept rules are usability filters; a server must validate uploaded content independently. */
export function selectFiles(
  files: readonly File[],
  accept: string,
  maxBytes: number,
  maxFiles: number,
) {
  const rules = accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  const accepted: File[] = [];
  const rejected: FileRejection[] = [];
  for (const file of files) {
    const matches =
      !rules.length ||
      rules.some((rule) =>
        rule.startsWith(".")
          ? file.name.toLowerCase().endsWith(rule)
          : rule.endsWith("/*")
            ? file.type.toLowerCase().startsWith(rule.slice(0, -1))
            : file.type.toLowerCase() === rule,
      );
    const code = !matches
      ? "type"
      : file.size > maxBytes
        ? "size"
        : accepted.length >= maxFiles
          ? "count"
          : undefined;
    if (code) rejected.push({ file, code });
    else accepted.push(file);
  }
  return { accepted, rejected };
}
