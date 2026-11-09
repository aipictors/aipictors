import { Container } from "@cloudflare/containers"

/**
 * 作品画像の年齢区分を判定するコンテナ（Dockerfile / app.py）。
 * 公開の URL は持たず、API の Worker から service binding で呼ばれる。
 * 使っていない間は止まり、次の依頼で起動する（モデルの読み込みで十数秒かかる）
 */
export class ImageTagger extends Container {
  defaultPort = 8510
  sleepAfter = "3m"
  envVars = { THREADS: "1" }

  async fetch(request) {
    await this.startAndWaitForPorts(8510, { portReadyTimeoutMS: 120_000 })
    return this.containerFetch(request, 8510)
  }
}

export default {
  fetch(request, env) {
    const id = env.IMAGE_TAGGER.idFromName("main")
    return env.IMAGE_TAGGER.get(id).fetch(request)
  },
}
