import { RotateCcwIcon } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"
import {
  GENERATION_SETTINGS_PRESETS,
  type GenerationSettingsPreset,
  toGenerationSamplerOptionValue,
} from "~/lib/generation-sampler"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useGenerationScheduler } from "~/routes/($lang).generation._index/hooks/use-generation-scheduler"

/**
 * 詳細設定の先頭。迷ったときにワンタップで戻せる設定
 */
export function GenerationConfigSamplingPresets() {
  const t = useTranslation()

  const context = useGenerationContext()

  const [scheduler, setScheduler] = useGenerationScheduler()

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

  return (
    <div className="space-y-3">
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
