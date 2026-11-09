// Worker の起動時にサーバーのビルドを読まずに版を知るため、build/build-version.json に書き出す
import { readdirSync, writeFileSync } from "node:fs"

const manifest = readdirSync("build/client/assets").find((name) =>
  /^manifest-[0-9a-f]+\.js$/.test(name),
)
if (manifest === undefined) {
  throw new Error("build/client/assets に manifest がありません")
}
const version = manifest.slice("manifest-".length, -".js".length)
writeFileSync("build/build-version.json", JSON.stringify({ version }))
