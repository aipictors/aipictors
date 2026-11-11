import type { Dispatch } from "react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { useUserModelPickup } from "~/components/user-models/user-model-pickup-banner"
import type { UserModelPickup } from "~/lib/user-models/types"
import type { PostImageFormInputAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-input-action"
import type { PostImageFormInputState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-input-state"

type GenerationResultLike = {
  prompt?: string | null
  model?: { name?: string | null } | null
}

/**
 * 生成結果が今週のピックアップモデルを使っているか
 * - LoRA: プロンプトの <lora:user_ID:w>
 * - チェックポイント: 生成結果のモデル名（みんなのモデルはモデルの名前で返る）
 */
export const usesPickupModel = (
  pickup: Pick<UserModelPickup, "model">,
  result: GenerationResultLike,
) => {
  if (pickup.model.kind === "LORA") {
    return (result.prompt ?? "").includes(`<lora:user_${pickup.model.id}:`)
  }
  return (result.model?.name ?? "") === pickup.model.name
}

type Props = {
  generationResults: GenerationResultLike[] | null | undefined
  tags: PostImageFormInputState["tags"]
  dispatchInput: Dispatch<PostImageFormInputAction>
}

/**
 * 生成画面から投稿するとき、ピックアップモデルで作った画像なら、その週のお題のタグを付けて参加させる
 */
export function usePickupModelAutoJoin(props: Props) {
  const { data: pickup } = useUserModelPickup()
  const appliedRef = useRef(false)

  useEffect(() => {
    if (appliedRef.current || !pickup?.eventSlug) return
    const results = props.generationResults ?? []
    if (results.length === 0) return
    if (!results.some((result) => usesPickupModel(pickup, result))) return
    appliedRef.current = true
    if (props.tags.some((tag) => tag.text === pickup.eventTag)) return
    props.dispatchInput({
      type: "ADD_TAG",
      payload: { id: Math.random().toString(), text: pickup.eventTag },
    })
    toast(
      `今週のピックアップモデルで作った画像なので、お題「${pickup.eventTag}」のタグを付けました`,
      { position: "top-center" },
    )
  }, [pickup, props.generationResults])
}
