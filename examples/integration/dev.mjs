import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { createIntegrationServer } from "./server.ts";

const api = createIntegrationServer();
await new Promise((resolve, reject) => {
  api.once("error", reject);
  api.listen(0, "127.0.0.1", resolve);
});
const address = api.address();
let web;
try {
  web = await createServer({
    configFile: false,
    root: fileURLToPath(new URL("./", import.meta.url)),
    plugins: [react()],
    server: {
      host: "127.0.0.1",
      port: Number(process.env.SUI_INTEGRATION_PORT ?? 5176),
      strictPort: true,
      proxy: { "^/api/": { target: `http://127.0.0.1:${address.port}` } },
    },
  });
  await web.listen();
  web.printUrls();
} catch (error) {
  api.close();
  throw error;
}
async function close() {
  await web.close();
  api.closeAllConnections();
  api.close();
}
process.once("SIGINT", () => void close());
process.once("SIGTERM", () => void close());
