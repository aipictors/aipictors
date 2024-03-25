import { CacheHandler } from "@neshca/cache-handler"

CacheHandler.onCreation(() => {
  const handler = {
    async get() {},
    async set() {},
    async revalidateTag() {},
    async delete() {},
  }

  return {
    handlers: [handler],
  }
})

export default CacheHandler
