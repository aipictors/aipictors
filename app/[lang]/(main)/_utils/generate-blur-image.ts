import { getPlaiceholder } from "plaiceholder"

// srcを引数とし、ボカシ効果のある画像のbase64データを返す関数
export async function generateBase64Blur(src: string): Promise<string> {
  try {
    // 画像URLからバッファを取得
    const buffer = await fetch(src).then(async (res) =>
      Buffer.from(await res.arrayBuffer()),
    )

    // バッファを使用してボカシ効果のあるbase64データを取得
    const { base64 } = await getPlaiceholder(buffer)

    // base64データを返す
    return base64
  } catch (err) {
    console.error("Error generating base64 blur:", err)
    throw new Error("Failed to generate base64 blur")
  }
}
