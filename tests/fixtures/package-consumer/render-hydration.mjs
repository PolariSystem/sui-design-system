import { readFile, writeFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./ssr-dist/App.js";

const template = await readFile("dist/index.html", "utf8");
await writeFile(
  "dist/index.html",
  template.replace(
    '<div id="root"></div>',
    `<div id="root">${renderToString(createElement(App))}</div>`,
  ),
);
