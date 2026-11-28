import { useQueries } from "@tanstack/react-query"
import { useContext } from "react"
import { officialBaseModel } from "~/components/model-library/model-library-utils"
import { userModelsQueryKeys } from "~/components/user-models/use-user-models"
import { AuthContext } from "~/contexts/auth-context"
import { fetchUserModel } from "~/lib/user-models/client"
import { baseModelLabel } from "~/lib/user-models/constants"
import { parseUserLoraName } from "~/lib/user-models/generation"
import {
  type CheckpointLoraFamily,
  isLoraUsableWith,
  type LoraFamily,
  loraFamilyLabel,
  officialCheckpointLoraFamily,
  officialLoraFamily,
  userCheckpointLoraFamily,
  userModelLoraFamily,
} from "~/lib/user-models/lora-compat"
import type { UserModelBaseModel } from "~/lib/user-models/types"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useUserModelSelection } from "~/routes/($lang).generation._index/hooks/use-user-model-selection"
import { findDitModelLabel } from "~/routes/($lang).generation._index/utils/dit-models"

export type SelectedLoraCompat = {
  /** プロンプトの <lora:NAME:..> の NAME */
  name: string
  /** 表示名（みんなのモデルは登録名） */
  displayName: string
  family: LoraFamily | null
  /** 表示用（SD1.5 / Illustrious など） */
  label: string | null
  /** みんなのモデルのベースモデル（おすすめの並びに使う） */
  baseModel: UserModelBaseModel | null
  /** 今のモデルで効くか（分からなければ null） */
  isUsable: boolean | null
}

type ImageModel = ReturnType<typeof useGenerationContext>["imageModels"][number]

/**
 * 公式モデルが LoRA のどの系統で使えるか
 */
export const imageModelLoraFamily = (model: {
  type: string
  name: string
}): CheckpointLoraFamily | null => {
  return officialCheckpointLoraFamily({
    type: model.type,
    isDit: findDitModelLabel(model.name) !== null,
  })
}

/**
 * LoRA の系統に合う公式モデルを、使いやすい順（同じベースモデル・お気に入り・最近・新しい）に並べる
 */
export const pickLoraRecommendedModels = <
  T extends { id: string; type: string; name: string; isNew?: boolean | null },
>(props: {
  imageModels: T[]
  family: LoraFamily
  preferredBase: UserModelBaseModel | null
  recentIds: string[]
  favoriteIds: string[]
  limit?: number
}): T[] => {
  const score = (model: T) => {
    let value = 0
    if (
      props.preferredBase &&
      officialBaseModel(model) === props.preferredBase
    ) {
      value += 8
    }
    if (props.favoriteIds.includes(model.id)) value += 4
    const recentIndex = props.recentIds.indexOf(model.id)
    if (recentIndex >= 0) value += 3 - Math.min(recentIndex, 2) * 0.5
    if (model.isNew) value += 2
    return value
  }
  return (
    props.imageModels
      .filter((model) => imageModelLoraFamily(model) === props.family)
      .map((model, index) => ({ model, index, score: score(model) }))
      // 同じ点数なら新しく足したもの（一覧の後ろ）を先に
      .sort((a, b) => b.score - a.score || b.index - a.index)
      .map((entry) => entry.model)
      .slice(0, props.limit ?? 8)
  )
}

/**
 * 選択中の LoRA と今のモデルの相性、LoRA に合うおすすめモデル
 */
export function useLoraCompatibility() {
  const context = useGenerationContext()
  const authContext = useContext(AuthContext)
  const userModelSelection = useUserModelSelection()

  const loraNames = context.promptLoraModels.map((text) => text.split(":")[0])

  const userLoraIds = loraNames
    .map((name) => parseUserLoraName(name))
    .filter((id): id is string => id !== null)

  // LoRA 欄と同じキーなので、取得は 1 回で済む
  const userLoraQueries = useQueries({
    queries: userLoraIds.map((id) => ({
      queryKey: userModelsQueryKeys.detail(id),
      enabled: !authContext.isLoading,
      queryFn: () => fetchUserModel(id),
      staleTime: 60_000,
      retry: false,
    })),
  })

  const userLoras = new Map<
    string,
    { name: string; baseModel: UserModelBaseModel }
  >()
  userLoraIds.forEach((id, index) => {
    const data = userLoraQueries[index]?.data
    if (data) userLoras.set(id, { name: data.name, baseModel: data.baseModel })
  })

  const officialModel = context.imageModels.find(
    (model) => model.id === context.config.modelId,
  )

  const checkpoint = userModelSelection.checkpoint

  const checkpointFamily: CheckpointLoraFamily | null = checkpoint
    ? userCheckpointLoraFamily(checkpoint.baseModel)
    : officialModel
      ? imageModelLoraFamily(officialModel)
      : null

  const checkpointName = checkpoint
    ? checkpoint.name
    : (officialModel?.displayName ?? officialModel?.name ?? "")

  const selected: SelectedLoraCompat[] = loraNames.map((name) => {
    const userId = parseUserLoraName(name)
    if (userId) {
      const userLora = userLoras.get(userId)
      const baseModel = userLora?.baseModel ?? null
      const family = userModelLoraFamily(baseModel)
      return {
        name,
        displayName: userLora?.name ?? name,
        family,
        label: baseModel ? baseModelLabel(baseModel) : null,
        baseModel,
        isUsable: isLoraUsableWith(family, checkpointFamily),
      }
    }
    const family = officialLoraFamily(name)
    return {
      name,
      displayName: name,
      family,
      label: loraFamilyLabel(family),
      baseModel: null,
      isUsable: isLoraUsableWith(family, checkpointFamily),
    }
  })

  const unusable = selected.filter((lora) => lora.isUsable === false)

  // 合わない LoRA があればそれに合わせ、なければ選択中の LoRA に合わせる（多いほう）
  const familyBase = unusable.length > 0 ? unusable : selected
  const sd1Count = familyBase.filter((lora) => lora.family === "SD1").length
  const sdxlCount = familyBase.filter((lora) => lora.family === "SDXL").length
  const targetFamily: LoraFamily | null =
    sd1Count === 0 && sdxlCount === 0
      ? null
      : sd1Count > sdxlCount
        ? "SD1"
        : "SDXL"

  // 同じベースモデル（Illustrious など）の LoRA があれば、そのモデルを先に出す
  const preferredBase =
    familyBase.find((lora) => lora.baseModel && lora.family === targetFamily)
      ?.baseModel ?? null

  const recommendedModels: ImageModel[] =
    targetFamily === null
      ? []
      : pickLoraRecommendedModels({
          imageModels: context.imageModels,
          family: targetFamily,
          preferredBase,
          recentIds: context.config.modelIds.map(String),
          favoriteIds: context.config.favoriteModelIds.map(String),
        })

  /**
   * そのモデルに切り替えたときに効かなくなる LoRA
   */
  const unusableWith = (family: CheckpointLoraFamily | null) => {
    return selected.filter(
      (lora) => isLoraUsableWith(lora.family, family) === false,
    )
  }

  return {
    selected,
    unusable,
    checkpointFamily,
    checkpointName,
    targetFamily,
    recommendedModels,
    unusableWith,
  }
}
