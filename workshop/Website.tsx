import { useEffect, useState, type ReactNode } from "react";
import { App } from "./App";
import { OpenSourceHome } from "./OpenSourceHome";
import { SiteFrame } from "./SiteFrame";

/** Preserve existing component URLs while giving the landing its own static-host-safe route. */
export function Website({
  home: homePage = <OpenSourceHome />,
}: {
  home?: ReactNode;
}) {
  const [fragment, setFragment] = useState(
    () => window.location.hash || "#home",
  );
  useEffect(() => {
    const update = () => {
      if (window.location.hash !== "#main")
        setFragment(window.location.hash || "#home");
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  const home = fragment.split("/")[0] === "#home";
  return (
    <SiteFrame fragment={fragment}>
      {home ? homePage : <App fragment={fragment} />}
    </SiteFrame>
  );
}
