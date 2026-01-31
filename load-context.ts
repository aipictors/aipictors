import type { PlatformProxy } from "wrangler"
import type { Env } from "./worker-configuration"

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare
  }
}
