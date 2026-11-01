import { RotateCcwIcon, SparklesIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import {
  describeRecommendedSettings,
  GENERATION_SETTINGS_PRESETS,
  type GenerationSettingsPreset,
  toGenerationSamplerOptionValue,
  toGenerationSchedulerValue,
} from "~/lib/generation-sampler"
import { fetchUserModel } from "~/lib/user-models/client"
import type { UserModelRecommendedSettings } from "~/lib/user-models/types"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useGenerationScheduler } from "~/routes/($lang).generation._index/hooks/use-generation-scheduler"
import { useUserModelSelection } from "~/routes/($lang).generation._index/hooks/use-user-model-selection"

/**
 * 詳細設定の先頭。迷ったときにワンタップで戻せる設定と、選んでいるモデルのおすすめ設定
 */
export function GenerationConfigSamplingPresets() {
  const t = useTranslation()

  const context = useGenerationContext()

  const [scheduler, setScheduler] = useGenerationScheduler()

  const userModelSelection = useUserModelSelection()

  const checkpoint = userModelSelection.checkpoint

  // 以前に選んだモデル（おすすめ設定を持っていない保存データ）は読み直す
  const [fetchedSettings, setFetchedSettings] = useState<{
    id: string
    settings: UserModelRecommendedSettings | null
  } | null>(null)

  useEffect(() => {
    if (!checkpoint || checkpoint.recommendedSettings !== undefined) return
    if (fetchedSettings?.id === checkpoint.id) return
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
    ? checkpoint.recommendedSettings !== undefined
      ? checkpoint.recommendedSettings
      : fetchedSettings?.id === checkpoint.id
        ? fetchedSettings.settings
        : null
    : null

  const isPresetActive = (preset: GenerationSettingsPreset) =>
    toGenerationSamplerOptionValue(context.config.sampler) === preset.sampler &&
    context.config.scale === preset.scale &&
    context.config.steps === preset.steps &&
    scheduler === preset.scheduler

  const applyPreset = (preset: GenerationSettingsPreset) => {
    context.updateSamplingSettings({
      sampler: preset.sampler,
      scale: preset.scale,
      steps: preset.steps,
    })
    setScheduler(preset.scheduler)
    toast(t(`「${preset.label}」にしました`, `Applied "${preset.labelEn}"`))
  }

  const applyRecommended = (settings: UserModelRecommendedSettings) => {
    context.updateSamplingSettings({
      sampler: settings.sampler
        ? toGenerationSamplerOptionValue(settings.sampler)
        : null,
      scale: settings.cfgScale,
      steps: settings.steps,
      clipSkip: settings.clipSkip,
    })
    if (settings.scheduler !== null || settings.sampler !== null) {
      setScheduler(toGenerationSchedulerValue(settings.scheduler))
    }
    toast(
      t(
        "モデルのおすすめ設定にしました",
        "Applied the model's recommended settings",
      ),
    )
  }

  return (
    <div className="space-y-3">
      {checkpoint && recommended && (
        <div className="space-y-2 rounded-md border border-primary/40 bg-primary/5 p-3">
          <p className="flex items-center gap-x-1.5 font-semibold text-sm">
            <SparklesIcon className="h-4 w-4 text-primary" />
            {t("このモデルのおすすめ設定", "Recommended for this model")}
          </p>
          <p className="text-muted-foreground text-xs">
            {checkpoint.name}：{describeRecommendedSettings(recommended)}
          </p>
          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={() => applyRecommended(recommended)}
          >
            {t("おすすめ設定を使う", "Use recommended settings")}
          </Button>
        </div>
      )}
      <div className="space-y-1.5">
        <p className="font-bold text-sm">
          {t("かんたん設定", "Quick settings")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {GENERATION_SETTINGS_PRESETS.map((preset) => {
            const active = isPresetActive(preset)
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                aria-pressed={active}
                className={`rounded-md border p-2 text-left transition-colors hover:bg-muted ${
                  active ? "border-primary bg-primary/5" : ""
                }`}
              >
                <span className="block font-semibold text-sm">
                  {t(preset.label, preset.labelEn)}
                </span>
                <span className="mt-0.5 block text-muted-foreground text-xs leading-snug">
                  {t(preset.description, preset.descriptionEn)}
                </span>
              </button>
            )
          })}
        </div>
        <p className="flex items-center gap-x-1 text-muted-foreground text-xs">
          <RotateCcwIcon className="h-3 w-3" />
          {t(
            "変えすぎて分からなくなったら「標準」を押すと元に戻ります。",
            'Press "Standard" to go back if you get lost.',
          )}
        </p>
      </div>
    </div>
  )
}
