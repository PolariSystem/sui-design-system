import { Link } from "../src";
import { supportHref } from "./site-config";
/** Shared opt-in support action; never a requirement for access. */
export function SupportLink() {
  return supportHref ? (
    <Link href={supportHref} target="_blank" rel="noopener noreferrer">
      Support Serenity UI
    </Link>
  ) : null;
}
