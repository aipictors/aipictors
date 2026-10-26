import { toast } from "sonner"
import { useLocalStorage } from "usehooks-ts"
import {
  normalizeLoraWeight,
  parseUserLoraName,
  type SelectedUserCheckpoint,
  splitTriggerWords,
  toGenerationModelType,
  toUserCheckpointModelName,
  toUserLoraName,
} from "~/lib/user-models/generation"
import type { UserModel } from "~/lib/user-models/types"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"

const STORAGE_KEY = "generation.userCheckpoint"

/**
 * 生成画面で「みんなのモデル」を選ぶための操作
 * - チェックポイント: 選択中を localStorage に保存し、生成時に model を user/<id>.safetensors にする
 * - LoRA: 既存の LoRA と同じくプロンプトに <lora:user_<id>:<weight>> を入れる
 */
export function useUserModelSelection() {
  const context = useGenerationContext()

  // 公式モデル一覧（id と種類だけ使う）
  const imageModels = context.imageModels as unknown as {
    id: string
    type: string
  }[]

  const [selection, setSelection] = useLocalStorage<
    (SelectedUserCheckpoint & { anchorModelId: string }) | null
  >(STORAGE_KEY, null, { initializeWithValue: false })

  /**
   * 生成に使う公式モデル（サイズ・コイン計算・バリデーション用）。
   * 公式モデルの種類が SD 系でなければ同じ種類の公式モデルに寄せる
   */
  const resolveAnchorModelId = (modelType: string): string => {
    const current = imageModels.find(
      (model) => model.id === context.config.modelId,
    )
    if (current && current.type === modelType) {
      return current.id
    }
    const sameType = imageModels.find((model) => model.type === modelType)
    return sameType?.id ?? current?.id ?? context.config.modelId
  }

  const selectCheckpoint = (model: UserModel) => {
    const modelType = toGenerationModelType(model.baseModel)
    const anchorModelId = resolveAnchorModelId(modelType)
    setSelection({
      id: model.id,
      name: model.name,
      baseModel: model.baseModel,
      thumbnailUrl: model.thumbnailUrl,
      officialModelId: context.config.modelId,
      anchorModelId,
    })
    context.updateModelId(anchorModelId, modelType)
  }

  /**
   * ユーザーチェックポイントをやめて元の公式モデルに戻す
   */
  const clearCheckpoint = (
    options: { restore: boolean } = { restore: true },
  ) => {
    const previous = selection
    setSelection(null)
    if (!options.restore || !previous) return
    const official = imageModels.find(
      (model) => model.id === previous.officialModelId,
    )
    if (official) {
      context.updateModelId(official.id, official.type)
    }
  }

  const selectedLoraIds = context.promptLoraModels
    .map((text) => parseUserLoraName(text.split(":")[0]))
    .filter((id): id is string => id !== null)

  /**
   * LoRA を追加・削除（追加時は推奨ウェイトとトリガーワードを入れる）
   */
  const toggleLora = (model: UserModel) => {
    const name = toUserLoraName(model.id)
    const isSelected = selectedLoraIds.includes(model.id)
    if (
      !isSelected &&
      context.promptLoraModels.length >= context.availableLoraModelsCount
    ) {
      toast(
        `LoRA は ${context.availableLoraModelsCount} 個まで使えます。どれかを外してから追加してください`,
      )
      return
    }
    const triggerWords = splitTriggerWords(model.triggerWords).join(", ")
    context.changeLoraModel(
      name,
      isSelected ? undefined : triggerWords || undefined,
      normalizeLoraWeight(model.recommendedWeight),
    )
  }

  const isCheckpointActive =
    selection !== null && selection.anchorModelId === context.config.modelId

  return {
    checkpoint: isCheckpointActive ? selection : null,
    /**
     * 公式モデルが変わったなどで無効になった選択（effect で掃除する）
     */
    staleCheckpoint: selection !== null && !isCheckpointActive,
    checkpointModelName: isCheckpointActive
      ? toUserCheckpointModelName(selection.id)
      : null,
    selectCheckpoint,
    clearCheckpoint,
    selectedLoraIds,
    toggleLora,
  }
}
