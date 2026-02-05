import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "static",         // ← これにする（または行ごと削除でもOK）
  site: "https://help.drrobo.ai/",
  adapter: cloudflare(),
  integrations: [tailwind()],
});
