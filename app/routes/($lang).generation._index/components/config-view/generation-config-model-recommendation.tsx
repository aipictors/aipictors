import { CheckIcon, ChevronDownIcon, SparklesIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import {
  describeRecommendedSettings,
  toGenerationSamplerOptionValue,
  toGenerationSchedulerValue,
} from "~/lib/generation-sampler"
import { fetchUserModel } from "~/lib/user-models/client"
import {
  addNegativePrompt,
  addQualityPrompt,
} from "~/lib/user-models/recommended-prompts"
import type { UserModelRecommendedSettings } from "~/lib/user-models/types"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useGenerationScheduler } from "~/routes/($lang).generation._index/hooks/use-generation-scheduler"
import { useUserModelSelection } from "~/routes/($lang).generation._index/hooks/use-user-model-selection"

/**
 * 選んでいるモデルのおすすめ設定（詳細設定を開かなくても見える場所に出す）
 * 「使う」で描き方の設定とプロンプトをまとめて入れる。すぐ元に戻せる
 */
export function GenerationConfigModelRecommendation() {
  const t = useTranslation()

  const context = useGenerationContext()

  const [scheduler, setScheduler] = useGenerationScheduler()

  const userModelSelection = useUserModelSelection()

  const checkpoint = userModelSelection.checkpoint

  const [isPromptOpen, setIsPromptOpen] = useState(false)

  // 選んだ時点の保存データは古いことがある（あとから自動で入ることもある）ので読み直す
  const [fetchedSettings, setFetchedSettings] = useState<{
    id: string
    settings: UserModelRecommendedSettings | null
  } | null>(null)

  useEffect(() => {
    if (!checkpoint) return
    let cancelled = false
    fetchUserModel(checkpoint.id)
      .then((model) => {
        if (cancelled) return
        setFetchedSettings({
          id: checkpoint.id,
          settings: model.recommendedSettings ?? null,
        })
      })
      .catch(() => {
        // 読めなくても生成には関係ないので黙る
      })
    return () => {
      cancelled = true
    }
  }, [checkpoint?.id])

  const recommended = checkpoint
    ? fetchedSettings?.id === checkpoint.id
      ? fetchedSettings.settings
      : (checkpoint.recommendedSettings ?? null)
    : null

  if (!checkpoint || !recommended) return null

  const summary = describeRecommendedSettings(recommended)

  const nextPrompt = addQualityPrompt(
    context.config.promptText,
    recommended.qualityPrompt,
  )
  const nextNegativePrompt = addNegativePrompt(
    context.config.negativePromptText,
    recommended.negativePrompt,
  )

  const isApplied =
    nextPrompt === context.config.promptText &&
    nextNegativePrompt === context.config.negativePromptText &&
    (recommended.sampler === null ||
      toGenerationSamplerOptionValue(context.config.sampler) ===
        toGenerationSamplerOptionValue(recommended.sampler)) &&
    (recommended.cfgScale === null ||
      context.config.scale === recommended.cfgScale) &&
    (recommended.steps === null ||
      context.config.steps === recommended.steps) &&
    (recommended.clipSkip === null ||
      context.config.clipSkip === recommended.clipSkip) &&
    (recommended.sampler === null && recommended.scheduler === null
      ? true
      : scheduler === toGenerationSchedulerValue(recommended.scheduler))

  const apply = () => {
    const previous = {
      prompt: context.config.promptText,
      negativePrompt: context.config.negativePromptText,
      sampler: context.config.sampler,
      scale: context.config.scale,
      steps: context.config.steps,
      clipSkip: context.config.clipSkip,
      scheduler,
    }

    context.updateSamplingSettings({
      sampler: recommended.sampler
        ? toGenerationSamplerOptionValue(recommended.sampler)
        : null,
      scale: recommended.cfgScale,
      steps: recommended.steps,
      clipSkip: recommended.clipSkip,
    })
    if (recommended.scheduler !== null || recommended.sampler !== null) {
      setScheduler(toGenerationSchedulerValue(recommended.scheduler))
    }
    context.updatePromptAndNegativePrompt(nextPrompt, nextNegativePrompt)

    toast(t("おすすめ設定にしました", "Applied the recommended settings"), {
      action: {
        label: t("元に戻す", "Undo"),
        onClick: () => {
          context.updateSamplingSettings({
            sampler: previous.sampler,
            scale: previous.scale,
            steps: previous.steps,
            clipSkip: previous.clipSkip,
          })
          setScheduler(previous.scheduler)
          context.updatePromptAndNegativePrompt(
            previous.prompt,
            previous.negativePrompt,
          )
        },
      },
    })
  }

  const sourceLabel =
    recommended.source === "civitai"
      ? t(
          `Civitai の作例${recommended.sampleCount ? ` ${recommended.sampleCount} 枚` : ""}の生成情報から自動で作成`,
          `Auto-generated from ${recommended.sampleCount ?? ""} Civitai sample images`,
        )
      : recommended.source === "base-model"
        ? t(
            "ベースモデルの定番の設定（自動）",
            "Common settings for this base model (auto)",
          )
        : t("モデルの登録者のおすすめ", "Recommended by the model's author")

  const hasPrompts = recommended.qualityPrompt || recommended.negativePrompt

  return (
    <div className="space-y-2 rounded-md border border-primary/40 bg-primary/5 p-3">
      <p className="flex items-center gap-x-1.5 font-semibold text-sm">
        <SparklesIcon className="h-4 w-4 shrink-0 text-primary" />
        {t("このモデルのおすすめ設定", "Recommended for this model")}
      </p>
      {summary !== "" && (
        <p className="break-words text-foreground/90 text-xs">{summary}</p>
      )}
      {hasPrompts && (
        <div>
          <button
            type="button"
            onClick={() => setIsPromptOpen((open) => !open)}
            aria-expanded={isPromptOpen}
            className="flex items-center gap-x-1 text-muted-foreground text-xs hover:text-foreground"
          >
            <ChevronDownIcon
              className={`h-3.5 w-3.5 transition-transform ${isPromptOpen ? "rotate-180" : ""}`}
            />
            {t("足されるプロンプトを見る", "Show the prompts")}
          </button>
          {isPromptOpen && (
            <dl className="mt-1.5 space-y-1.5 text-xs">
              {recommended.qualityPrompt && (
                <div>
                  <dt className="text-muted-foreground">
                    {t("品質プロンプト（先頭に足す）", "Quality (added first)")}
                  </dt>
                  <dd className="break-words">{recommended.qualityPrompt}</dd>
                </div>
              )}
              {recommended.negativePrompt && (
                <div>
                  <dt className="text-muted-foreground">
                    {t("ネガティブプロンプト", "Negative prompt")}
                  </dt>
                  <dd className="break-words">{recommended.negativePrompt}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      )}
      <Button
        type="button"
        size="sm"
        className="w-full"
        disabled={isApplied}
        onClick={apply}
      >
        {isApplied ? (
          <>
            <CheckIcon className="mr-1 h-4 w-4" />
            {t("おすすめ設定を使用中", "Using recommended settings")}
          </>
        ) : (
          t("おすすめ設定を使う", "Use recommended settings")
        )}
      </Button>
      <p className="text-[11px] text-muted-foreground">{sourceLabel}</p>
    </div>
  )
}
