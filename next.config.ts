import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Dashboard pages fetch live Odoo data on every request, so Cache
     Components / PPR would require wrapping nearly everything in
     Suspense for no real benefit here. Keep it off. */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
