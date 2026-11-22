/**
 * wasm-webp の Emscripten のモジュール（型が同梱されていない）。
 * 使う側（animated-gif-to-webp.ts）で必要なところだけ型を付ける
 */
declare module "wasm-webp/dist/esm/webp-wasm.js" {
  const createModule: (options?: {
    locateFile?: (path: string) => string
  }) => Promise<never>
  export default createModule
}
