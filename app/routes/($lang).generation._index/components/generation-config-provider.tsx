import { useState } from "react"
import { config } from "~/config"
import { GenerationConfigPersistent } from "~/routes/($lang).generation._index/components/generation-config-persistent"
import { GenerationConfigRestoration } from "~/routes/($lang).generation._index/components/generation-config-restoration"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { generationConfigMachine } from "~/routes/($lang).generation._index/machines/generation-config-machine"
import { GenerationConfigState } from "~/routes/($lang).generation._index/machines/models/generation-config-state"
import {
  type LargeFieldRefs,
  takeLargeFieldRefs,
} from "~/routes/($lang).generation._index/utils/generation-state-persister"
import { getDefaultNegativePrompt } from "~/routes/($lang).generation._index/utils/get-default-negative-prompt"
import {
  GENERATION_STATE_STORAGE_KEY,
  MAX_GENERATION_STATE_LENGTH,
  persistGenerationSnapshot,
} from "~/routes/($lang).generation._index/utils/persist-generation-snapshot"
import { restoreGenerationSnapshot } from "~/routes/($lang).generation._index/utils/restore-generation-snapshot"

type PersistedState = {
  snapshot: ReturnType<typeof restoreGenerationSnapshot>
  /** IndexedDB に置いた画像のキー（画像は後から読み込む） */
  largeFieldRefs: LargeFieldRefs
}

/**
 * 保存済みの画面状態を読み込む
 */
function readPersistedSnapshot(): PersistedState {
  if (typeof document === "undefined") {
    return { snapshot: undefined, largeFieldRefs: {} }
  }
  let stateText: string | null = null
  try {
    stateText = localStorage.getItem(GENERATION_STATE_STORAGE_KEY)
  } catch (_error) {
    return { snapshot: undefined, largeFieldRefs: {} }
  }
  // IndexedDB に移せるなら、大きすぎる古い保存データの画像も捨てずに読み、あとで移す
  const canUseIndexedDb = "indexedDB" in window
  const snapshot = restoreGenerationSnapshot(
    stateText,
    Object.keys(generationConfigMachine.config.states ?? {}),
    { keepLargeFields: canUseIndexedDb },
  )
  const largeFieldRefs = takeLargeFieldRefs(snapshot)
  // 大きすぎる保存データは小さくして書き直し、ほかの保存に使える容量を空ける
  if (
    !canUseIndexedDb &&
    stateText !== null &&
    stateText.length > MAX_GENERATION_STATE_LENGTH
  ) {
    if (snapshot === undefined) {
      try {
        localStorage.removeItem(GENERATION_STATE_STORAGE_KEY)
      } catch (_error) {}
    } else {
      persistGenerationSnapshot(localStorage, snapshot)
    }
  }
  return { snapshot, largeFieldRefs }
}

type Props = {
  children: React.ReactNode
}

/**
 * エディタの設定を提供する
 * @param props
 */
export function GenerationConfigProvider(props: Props) {
  const modelType = config.generationFeature.defaultImageModelType

  // 読み込みは最初の描画で 1 回だけ（状態機械は最初の値しか使わない）
  const [{ snapshot, largeFieldRefs }] = useState(readPersistedSnapshot)

  return (
    <GenerationConfigContext.Provider
      options={{
        snapshot: snapshot,
        input: new GenerationConfigState({
          modelId: config.generationFeature.defaultImageModelId,
          searchModelId: null,
          searchModelName: null,
          modelIds: config.generationFeature.defaultImageModelIds,
          favoriteModelIds: [],
          promptText: "",
          negativePromptText: getDefaultNegativePrompt(modelType),
          sampler: config.generationFeature.defaultSamplerValue,
          scale: config.generationFeature.defaultScaleValue,
          seed: -1,
          sizeType: "SD1_512_768",
          steps: config.generationFeature.defaultStepsValue,
          vae: config.generationFeature.defaultVaeValue,
          modelType: modelType,
          clipSkip: config.generationFeature.defaultClipSkipValue,
          isUseRecommendedPrompt:
            config.generationFeature.defaultIsUseRecommendedPrompt,
          i2iImageBase64: "",
          i2iDenoisingStrengthSize:
            config.generationFeature.defaultI2iDenoisingStrengthSize,
          previewTaskId: null,
          viewTaskId: null,
          viewTaskIds: [],
          thumbnailSizeInPromptView:
            config.generationFeature.defaultThumbnailSizeInPromptView,
          thumbnailSizeInHistoryListFull:
            config.generationFeature.defaultThumbnailSizeInHistoryListFull,
          taskListThumbnailType: config.generationFeature.defaultThumbnailType,
          upscaleSize: 1,
          page: 1,
          controlNetImageBase64: "",
          controlNetMaskImageBase64: "",
          controlNetControlMode: "",
          controlNetEnabled: false,
          controlNetGuidanceEnd: 0,
          controlNetGuidanceStart: 0,
          controlNetPixelPerfect: false,
          controlNetProcessorRes: 0,
          controlNetResizeMode: "",
          controlNetThresholdA: 0.5,
          controlNetThresholdB: 0.5,
          controlNetWeight: 1,
          controlNetModule: null,
          controlNetModel: null,
          controlNetSaveDetectedMap: null,
          controlNetHrOption: null,
          previewImageURL: null,
          currentUserToken: null,
          generationCount: 1,
          languageUsedForPrompt: null,
        }),
      }}
    >
      <GenerationConfigPersistent largeFieldRefs={largeFieldRefs}>
        <GenerationConfigRestoration>
          {props.children}
        </GenerationConfigRestoration>
      </GenerationConfigPersistent>
    </GenerationConfigContext.Provider>
  )
}
