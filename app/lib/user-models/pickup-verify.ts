import type { UserModelPickup } from "~/lib/user-models/types"

/**
 * ピックアップモデルのお題に参加できる画像か（PNG の生成情報で確かめる）
 *
 * - Aipictors の生成機から投稿した画像は、生成履歴のプロンプト・モデルで確かめる
 * - アップロードした画像は、PNG に書かれたハッシュで確かめる
 *   - チェックポイント: A1111/Forge の「Model hash」（sha256 の先頭 10 文字）
 *   - LoRA: 「Lora hashes」（ヘッダーを除いた本体の sha256 の先頭 12 文字。サーバーが addnetHash として計算する）。
 *     Civitai などの「Hashes」に入る sha256 の先頭 10 文字も受け付ける
 * - 生成情報は書き換えられるので、ズルは防げない（間違えて別のモデルで参加するのを防ぐ仕組み）
 * - ComfyUI など、ハッシュが書かれない画像は確かめられないので参加できない
 */
export type PickupVerifyResult =
  | { ok: true; via: "generation" | "hash" }
  | { ok: false; reason: "NO_INFO" | "MISMATCH" }

type PickupModel = Pick<
  UserModelPickup["model"],
  "id" | "kind" | "name" | "sha256"
> & { addnetHash?: string | null }

const HEX = /^[0-9a-f]+$/

/** 照合に使える長さ（短いハッシュは別の方式・偶然の一致があるので使わない） */
const MIN_HASH_LENGTH = 10

const normalizeHash = (value: string) => value.trim().toLowerCase()

/**
 * PNG の生成情報（A1111 形式のテキスト）から、モデルと LoRA のハッシュを取り出す
 */
export const extractModelHashes = (src: string | null | undefined) => {
  const text = src ?? ""
  const modelHashes: string[] = []
  const loraHashes: string[] = []
  for (const match of text.matchAll(/Model hash:\s*([0-9a-fA-F]+)/g)) {
    modelHashes.push(normalizeHash(match[1]))
  }
  for (const match of text.matchAll(/Lora hashes:\s*"([^"]*)"/g)) {
    for (const entry of match[1].split(",")) {
      const hash = entry.slice(entry.lastIndexOf(":") + 1)
      if (hash.trim()) loraHashes.push(normalizeHash(hash))
    }
  }
  // Civitai などの「Hashes: {"model": "…", "lora:名前": "…"}」
  for (const match of text.matchAll(/Hashes:\s*(\{[^}]*\})/g)) {
    try {
      const parsed = JSON.parse(match[1]) as Record<string, unknown>
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value !== "string") continue
        if (key === "model") modelHashes.push(normalizeHash(value))
        if (key.startsWith("lora:")) loraHashes.push(normalizeHash(value))
      }
    } catch {
      // 壊れた JSON は読まない
    }
  }
  const usable = (hashes: string[]) =>
    [...new Set(hashes)].filter(
      (hash) => hash.length >= MIN_HASH_LENGTH && HEX.test(hash),
    )
  return { modelHashes: usable(modelHashes), loraHashes: usable(loraHashes) }
}

const matchesFull = (full: string | null | undefined, hashes: string[]) => {
  const target = (full ?? "").toLowerCase()
  if (!target) return false
  return hashes.some((hash) => target.startsWith(hash))
}

/**
 * アップロードした画像の PNG の生成情報が、ピックアップモデルを使っているか
 */
export const verifyPickupByPngInfo = (
  model: PickupModel,
  src: string | null | undefined,
): PickupVerifyResult => {
  const text = src ?? ""
  // Aipictors で生成した画像（プロンプトの <lora:user_ID:…> / モデルの user/ID.safetensors）
  if (text.includes(`user_${model.id}`) || text.includes(`user/${model.id}`)) {
    return { ok: true, via: "generation" }
  }
  const { modelHashes, loraHashes } = extractModelHashes(text)
  if (model.kind === "LORA") {
    if (loraHashes.length === 0) return { ok: false, reason: "NO_INFO" }
    const ok =
      matchesFull(model.addnetHash, loraHashes) ||
      matchesFull(model.sha256, loraHashes)
    return ok ? { ok: true, via: "hash" } : { ok: false, reason: "MISMATCH" }
  }
  if (modelHashes.length === 0) return { ok: false, reason: "NO_INFO" }
  return matchesFull(model.sha256, modelHashes)
    ? { ok: true, via: "hash" }
    : { ok: false, reason: "MISMATCH" }
}

/**
 * 生成機から投稿した画像（生成履歴のプロンプト・モデル名）が、ピックアップモデルを使っているか
 */
export const verifyPickupByGeneration = (
  model: PickupModel,
  result: { prompt?: string | null; modelName?: string | null },
): boolean => {
  if (model.kind === "LORA") {
    return (result.prompt ?? "").includes(`<lora:user_${model.id}:`)
  }
  return (result.modelName ?? "") === model.name
}

/** 参加できないときの案内 */
export const pickupVerifyMessage = (
  pickup: Pick<UserModelPickup, "eventTag"> & { model: { name: string } },
  reason: "NO_INFO" | "MISMATCH",
) =>
  reason === "NO_INFO"
    ? `お題「${pickup.eventTag}」は「${pickup.model.name}」で作った画像だけ参加できます。この画像には確かめられる生成情報（モデルのハッシュ）がないため参加できません。タグを外して投稿してください`
    : `お題「${pickup.eventTag}」は「${pickup.model.name}」で作った画像だけ参加できます。この画像の生成情報のモデルが違うため参加できません。タグを外して投稿してください`
