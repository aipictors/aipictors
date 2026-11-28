/**
 * 拡散モデル・テキストエンコーダー・VAE が別ファイルの新しい世代のモデル（Z-Image など）。
 * 生成サーバー（ComfyUI 版）が名前で見分け、ステップ数・CFG・サンプラーは推奨値に固定する。
 * LoRA（SD 用）・ControlNet は使えない
 */
const DIT_MODELS = [
  { pattern: /^z[_-]?image[_-]?turbo$/i, label: "Z-Image Turbo" },
  // MOSS Image（OpenMOSS）と派生の Jib Mix Moss（Civitai）
  { pattern: /^moss[_-]image$/i, label: "MOSS Image" },
  { pattern: /^moss[_-]jibmix[_-]v3$/i, label: "Jib Mix Moss" },
  // animagine・animaPencil などの SDXL モデルと区別するため、名前全体で見る
  { pattern: /^anima([_-](turbo|base|aesthetic))?$/i, label: "Anima" },
] as const

/**
 * DiT 系のモデルなら表示名（違えば null）
 */
export const findDitModelLabel = (
  modelName: string | null | undefined,
): string | null => {
  if (!modelName) return null
  const name = (modelName.trim().split("/").pop() ?? "")
    .replace(/\s*\[[0-9a-f]{8,64}\]$/i, "")
    .replace(/\.(safetensors|ckpt)$/i, "")
  return DIT_MODELS.find((model) => model.pattern.test(name))?.label ?? null
}

/**
 * DiT かどうかの判定に使うモデル名。みんなのモデルの MOSS Image（user/<id>.safetensors）は
 * 公式の MOSS Image と同じ扱いにする（ControlNet・SD 用 LoRA は使えない）
 */
export const toDitCheckModelName = (props: {
  officialModelName: string | null | undefined
  userCheckpointBaseModel?: string | null
}): string | null | undefined =>
  props.userCheckpointBaseModel === "MOSS"
    ? "moss_image"
    : props.officialModelName
