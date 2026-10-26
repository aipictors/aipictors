import { useSearchParams } from "@remix-run/react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { useUserModel } from "~/components/user-models/use-user-models"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useUserModelSelection } from "~/routes/($lang).generation._index/hooks/use-user-model-selection"

/**
 * /generation?userModel=<id> で開いたとき、そのモデルを選択済みにする
 * （モデル詳細の「このモデルで生成」から遷移する）
 */
export function GenerationUserModelFromUrl() {
  const [searchParams, setSearchParams] = useSearchParams()
  const userModelId = searchParams.get("userModel")
  const context = useGenerationContext()
  const selection = useUserModelSelection()
  const appliedRef = useRef<string | null>(null)

  const { data: model, error } = useUserModel(userModelId)

  const removeParam = () => {
    const next = new URLSearchParams(searchParams)
    next.delete("userModel")
    setSearchParams(next, { replace: true, preventScrollReset: true })
  }

  useEffect(() => {
    if (!userModelId || error === null) return
    toast("モデルを読み込めませんでした。削除された可能性があります")
    removeParam()
  }, [error])

  useEffect(() => {
    if (!model || !userModelId || appliedRef.current === userModelId) return
    if (context.imageModels.length === 0) return
    appliedRef.current = userModelId

    if (model.status !== "READY") {
      toast("このモデルはまだ生成に使えません")
      removeParam()
      return
    }

    if (model.kind === "CHECKPOINT") {
      selection.selectCheckpoint(model)
      toast(`「${model.name}」を選択しました`, { position: "top-center" })
    } else if (!selection.selectedLoraIds.includes(model.id)) {
      selection.toggleLora(model)
      toast(`LoRA「${model.name}」を追加しました`, { position: "top-center" })
    }
    removeParam()
  }, [model, context.imageModels.length])

  return null
}
