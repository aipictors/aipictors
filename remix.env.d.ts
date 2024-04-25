/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/cloudflare-pages" />
/// <reference types="@cloudflare/workers-types" />

import "@remix-run/cloudflare"

declare global {
  interface CacheStorage {
    default: Cache
  }
}

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    env: Env
    ctx: EventContext<Env>
  }
}
