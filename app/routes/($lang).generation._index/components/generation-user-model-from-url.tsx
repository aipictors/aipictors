import { useSearchParams } from "@remix-run/react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useUserModel } from "~/components/user-models/use-user-models"
import { config } from "~/config"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
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

  /**
   * 画面を開いた直後は、設定の初期化（resetForInit など）が同じタイミングで走り、
   * 先に選んだモデルを古い設定で上書きしてしまう。初期化が終わってから選ぶ
   */
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isReady) return
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
    }
    removeParams(["userModel"])
  }, [isReady, model, context.imageModels.length])

  useEffect(() => {
    if (!isReady) return
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
        const prompt = official.prompts.join(",")
        if (context.config.isUseRecommendedPrompt) {
          context.updateModelIdAndPrompt(
            official.id,
            official.type,
            prompt === ""
              ? config.generationFeature.defaultPromptValue
              : prompt,
          )
        } else {
          context.updateModelId(official.id, official.type)
        }
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
        }
      }
    }
    removeParams(["model", "lora"])
  }, [isReady, officialModelId, officialLoraName, context.imageModels.length])

  return null
}
