/// <reference types="@react-router/dev" />
/// <reference types="@react-router/cloudflare" />
/// <reference types="@cloudflare/workers-types" />

import "@react-router/cloudflare"

declare global {
  interface CacheStorage {
    default: Cache
  }
}

declare module "@react-router/cloudflare" {
  interface AppLoadContext {
    env: Env
    ctx: EventContext<Env>
  }
}
