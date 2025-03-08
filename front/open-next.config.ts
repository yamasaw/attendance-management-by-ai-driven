import type { OpenNextConfig } from "@opennextjs/aws/types/open-next.js";

// シンプルな設定
const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: "cloudflare",
      converter: "edge",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
};

export default config; 