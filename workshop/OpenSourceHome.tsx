import { Card, Link } from "../src";
import { repositoryHref } from "./site-config";
import { SupportLink } from "./SupportLink";

/** Public workshop entry point. The separate website supplies its own landing composition. */
export function OpenSourceHome() {
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-6xl p-4">
      <Card className="flex flex-col gap-4">
        <p className="text-sui-label-md text-sui-text-link">
          Serenity UI · Open source
        </p>
        <h1 className="text-sui-heading-xl">
          A clear foundation. Room to build.
        </h1>
        <p>
          React components, shared design tokens and editable Figma foundations.
          The complete system is available under MIT.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="#button">Explore components</Link>
          <Link href="#documentation">Get started</Link>
          <Link href={repositoryHref}>View on GitHub</Link>
          <SupportLink />
        </div>
      </Card>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          [
            "Foundations",
            "Semantic colors, responsive typography, spacing and motion.",
            "#foundations",
          ],
          [
            "Components",
            "Working states, keyboard behavior and adaptable layouts.",
            "#button",
          ],
          [
            "Pages",
            "Dashboards and access flows composed from the same library.",
            "#dashboard",
          ],
        ].map(([name, text, href]) => (
          <Card key={name}>
            <h2 className="text-sui-heading-sm">{name}</h2>
            <p className="my-4">{text}</p>
            <Link href={href}>Explore {name.toLowerCase()}</Link>
          </Card>
        ))}
      </div>
      <Card id="home-community" tabIndex={-1} className="mt-4">
        <h2 className="text-sui-heading-sm">Build together</h2>
        <p className="my-4">
          Report an issue, improve an example or contribute a component. The
          complete system stays open to everyone.
        </p>
        <Link href={`${repositoryHref}/blob/main/CONTRIBUTING.md`}>
          Contribute on GitHub
        </Link>
        <SupportLink />
      </Card>
    </main>
  );
}
