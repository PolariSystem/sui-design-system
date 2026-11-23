import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import * as kit from "@serenity-ui/react";
import tokens from "@serenity-ui/react/tokens.json" with { type: "json" };

// Run in Node without window/document: the package must be importable during server rendering.
assert.equal(tokens.variables.length, 808);
assert.ok(
  tokens.variables.some(
    (token) => token.name === "type/mobile/heading/xl/size",
  ),
);
assert.equal(typeof kit.ScrollArea, "function");
assert.equal(typeof kit.Button, "function");
assert.equal(typeof kit.DashboardEditor, "function");
assert.equal(typeof kit.AuthScreen, "function");
assert.match(
  import.meta.resolve("@serenity-ui/react/styles.css"),
  /serenity-ui\.css$/,
);
assert.match(
  import.meta.resolve("@serenity-ui/react/styles-no-preflight.css"),
  /serenity-ui-no-preflight\.css$/,
);
assert.match(
  import.meta.resolve("@serenity-ui/react/theme.css"),
  /serenity-theme\.css$/,
);
for (const element of [
  createElement(
    kit.ScrollArea,
    null,
    createElement(
      kit.ScrollAreaViewport,
      { "aria-label": "Server activity" },
      "Activity",
    ),
    createElement(kit.ScrollBar),
  ),
  createElement(kit.Button, null, "Server action"),
  createElement(
    kit.Select,
    { label: "Server select", defaultValue: "a" },
    createElement("option", { value: "a" }, "Option A"),
  ),
  createElement(kit.AuthScreen, {
    screen: {
      step: "check-inbox",
      email: "team@example.com",
      signInHref: "/sign-in",
      changeEmailHref: "/recover",
      onResend() {},
    },
    animated: false,
  }),
])
  assert.ok(renderToString(element).length > 0);
console.log(
  `Server rendering passed; ${Object.keys(kit).length} public runtime exports resolved.`,
);
