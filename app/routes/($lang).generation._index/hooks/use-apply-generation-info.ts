import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useGenerationScheduler } from "~/routes/($lang).generation._index/hooks/use-generation-scheduler"
import { toTaskSizeType } from "~/routes/($lang).generation._index/types/generation-size"
import type { GenerationInfoEntry } from "~/routes/($lang).generation._index/utils/generation-info-file"

/**
 * 生成情報（履歴の設定や読み込んだファイル）を生成画面の設定に入れる
 */
export function useApplyGenerationInfo() {
  const context = useGenerationContext()
  const [, setScheduler] = useGenerationScheduler()
  const t = useTranslation()

  return (entry: GenerationInfoEntry) => {
    context.updateSettings(
      entry.model.id,
      entry.steps,
      entry.model.type,
      entry.sampler,
      entry.scale,
      entry.vae ?? "",
      entry.prompt,
      entry.negativePrompt,
      entry.seed,
      toTaskSizeType(entry),
      entry.clipSkip,
      null,
      null,
      null,
      null,
    )
    setScheduler(entry.scheduler ?? null)
    toast(t("設定を復元しました", "Settings restored"))
  }
}
