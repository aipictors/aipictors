import { useSearchParams } from "@remix-run/react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { useUserModel } from "~/components/user-models/use-user-models"
import {
  isLoraUsableWith,
  type LoraFamily,
  loraFamilyLabel,
  officialLoraFamily,
  userCheckpointLoraFamily,
  userModelLoraFamily,
} from "~/lib/user-models/lora-compat"
import type { UserModelBaseModel } from "~/lib/user-models/types"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import {
  imageModelLoraFamily,
  pickLoraRecommendedModels,
} from "~/routes/($lang).generation._index/hooks/use-lora-compatibility"
import { useUserModelSelection } from "~/routes/($lang).generation._index/hooks/use-user-model-selection"

/**
 * URL で指定したモデルを選択済みにする
 * - ?userModel=<id> みんなのモデル（モデル詳細の「このモデルで生成」）
 * - ?model=<id> 公式モデル、?lora=<name> 公式 LoRA（モデルライブラリの「生成に使う」）
 */
export function GenerationUserModelFromUrl() {
  const [searchParams, setSearchParams] = useSearchParams()
  const userModelId = searchParams.get("userModel")
  const officialModelId = searchParams.get("model")
  const officialLoraName = searchParams.get("lora")
  const context = useGenerationContext()
  const selection = useUserModelSelection()
  const appliedRef = useRef<string | null>(null)
  const appliedOfficialRef = useRef<string | null>(null)

  const { data: model, error } = useUserModel(userModelId)

  /**
   * URL から足した LoRA が今のモデルで効かないときは、合うモデルに切り替える
   * （LoRA のページの「このモデルで生成」から来た人が、効かない組み合わせのまま生成しないように）
   */
  const switchModelForLora = (props: {
    loraName: string
    family: LoraFamily | null
    baseModel: UserModelBaseModel | null
  }) => {
    if (props.family === null) return
    const current = context.imageModels.find(
      (item) => item.id === context.config.modelId,
    )
    const currentFamily = selection.checkpoint
      ? userCheckpointLoraFamily(selection.checkpoint.baseModel)
      : current
        ? imageModelLoraFamily(current)
        : null
    if (isLoraUsableWith(props.family, currentFamily) !== false) return
    const [next] = pickLoraRecommendedModels({
      imageModels: context.imageModels,
      family: props.family,
      preferredBase: props.baseModel,
      recentIds: context.config.modelIds.map(String),
      favoriteIds: context.config.favoriteModelIds.map(String),
      limit: 1,
    })
    if (!next) return
    const previousCheckpoint = selection.checkpoint
    if (previousCheckpoint) {
      selection.clearCheckpoint({ restore: false })
    }
    context.updateModelId(next.id, next.type)
    toast(
      `LoRA「${props.loraName}」は ${loraFamilyLabel(props.family)} 用なので、モデルを「${next.displayName ?? next.name}」に切り替えました`,
      {
        position: "top-center",
        duration: 8000,
        action:
          current && !previousCheckpoint
            ? {
                label: "元に戻す",
                onClick: () => context.updateModelId(current.id, current.type),
              }
            : undefined,
      },
    )
  }

  const removeParams = (names: string[]) => {
    const next = new URLSearchParams(searchParams)
    for (const name of names) next.delete(name)
    setSearchParams(next, { replace: true, preventScrollReset: true })
  }

  useEffect(() => {
    if (!userModelId || error === null) return
    toast("モデルを読み込めませんでした。削除された可能性があります")
    removeParams(["userModel"])
  }, [error])

  useEffect(() => {
    if (!model || !userModelId || appliedRef.current === userModelId) return
    if (context.imageModels.length === 0) return
    appliedRef.current = userModelId

    if (model.status !== "READY") {
      toast("このモデルはまだ生成に使えません")
      removeParams(["userModel"])
      return
    }

    if (model.kind === "CHECKPOINT") {
      selection.selectCheckpoint(model)
      toast(`「${model.name}」を選択しました`, { position: "top-center" })
    } else if (!selection.selectedLoraIds.includes(model.id)) {
      selection.toggleLora(model)
      toast(`LoRA「${model.name}」を追加しました`, { position: "top-center" })
      switchModelForLora({
        loraName: model.name,
        family: userModelLoraFamily(model.baseModel),
        baseModel: model.baseModel,
      })
    }
    removeParams(["userModel"])
  }, [model, context.imageModels.length])

  useEffect(() => {
    if (!officialModelId && !officialLoraName) return
    if (context.imageModels.length === 0) return
    const key = `${officialModelId}:${officialLoraName}`
    if (appliedOfficialRef.current === key) return
    appliedOfficialRef.current = key

    if (officialModelId) {
      const official = context.imageModels.find(
        (item) => item.id === officialModelId,
      )
      if (official) {
        if (selection.checkpoint) {
          selection.clearCheckpoint({ restore: false })
        }
        context.updateModelId(official.id, official.type)
        toast(`「${official.displayName ?? official.name}」を選択しました`, {
          position: "top-center",
        })
      }
    } else if (officialLoraName) {
      const lora = context.imageLoraModels.find(
        (item) => item.name === officialLoraName,
      )
      const isSelected = context.promptLoraModels.some(
        (text) => text.split(":")[0] === officialLoraName,
      )
      if (lora && !isSelected) {
        if (
          context.promptLoraModels.length >= context.availableLoraModelsCount
        ) {
          toast(
            `LoRA は ${context.availableLoraModelsCount} 個まで使えます。どれかを外してから追加してください`,
          )
        } else {
          context.changeLoraModel(
            lora.name,
            typeof lora.triggerWord === "string" && lora.triggerWord !== ""
              ? lora.triggerWord
              : undefined,
          )
          toast(`LoRA「${lora.name}」を追加しました`, {
            position: "top-center",
          })
          switchModelForLora({
            loraName: lora.name,
            family: officialLoraFamily(lora.name),
            baseModel: null,
          })
        }
      }
    }
    removeParams(["model", "lora"])
  }, [officialModelId, officialLoraName, context.imageModels.length])

  return null
}
