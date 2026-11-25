import type { LoraDetail } from "~/lib/lora-details/lora-detail"
import details from "~/lib/lora-details/lora-details.json"

/**
 * 公式 LoRA の紹介を名前で引く（画面の表示時に外へ取りに行かず、同梱の JSON から返す）
 * サーバーだけで読み込み、ローダーはその LoRA の 1 件だけを画面に渡す
 */
const detailMap = new Map(
  (details as LoraDetail[]).map((detail) => [
    normalizeLoraName(detail.name),
    detail,
  ]),
)

function normalizeLoraName(name: string) {
  return name
    .trim()
    .replace(/\.safetensors$/i, "")
    .toLowerCase()
}

export const findLoraDetail = (
  name: string | null | undefined,
): LoraDetail | null => {
  if (!name) {
    return null
  }
  return detailMap.get(normalizeLoraName(name)) ?? null
}

/**
 * 紹介のある LoRA の名前（同じ系統の LoRA の一覧に使う）
 */
export const listLoraDetails = (): LoraDetail[] => details as LoraDetail[]
