import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: "https://concise-toucan-77.clerk.accounts.dev",
      applicationID: "convex",
    },
  ]
} satisfies AuthConfig;