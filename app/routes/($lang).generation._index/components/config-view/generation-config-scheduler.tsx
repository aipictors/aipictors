import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { useTranslation } from "~/hooks/use-translation"
import { GENERATION_SCHEDULER_OPTIONS } from "~/lib/generation-sampler"
import { GenerationConfigFieldLabel } from "~/routes/($lang).generation._index/components/config-view/generation-config-field-label"

type Props = {
  /**
   * null は自動
   */
  value: string | null
  onChange(value: string | null): void
}

// Select は空文字を値にできないので「自動」はこの値で表す
const AUTO = "auto"

/**
 * Schedule type（ノイズの減らし方）
 */
export function GenerationConfigScheduler(props: Props) {
  const t = useTranslation()

  const selected =
    GENERATION_SCHEDULER_OPTIONS.find(
      (option) => option.value === props.value,
    ) ?? GENERATION_SCHEDULER_OPTIONS[0]

  return (
    <div className="flex flex-col gap-y-2">
      <GenerationConfigFieldLabel
        label={t("Schedule type（ノイズの減らし方）", "Schedule type")}
        hint={t(
          "仕上がりの質感が少し変わります。ふつうは「自動」のままで大丈夫です。",
          'Slightly changes the finish. "Automatic" is fine in most cases.',
        )}
      />
      <Select
        value={props.value ?? AUTO}
        onValueChange={(next) => {
          props.onChange(next === AUTO ? null : next)
        }}
      >
        <SelectTrigger aria-label="Schedule type">
          <SelectValue>{t(selected.label, selected.labelEn)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {GENERATION_SCHEDULER_OPTIONS.map((option) => (
            <SelectItem key={option.value ?? AUTO} value={option.value ?? AUTO}>
              <span className="flex flex-col">
                <span>{t(option.label, option.labelEn)}</span>
                <span className="text-muted-foreground text-xs">
                  {t(option.description, option.descriptionEn)}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
