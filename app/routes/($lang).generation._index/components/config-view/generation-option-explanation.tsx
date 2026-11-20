import { ClockIcon, CoinsIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = {
  /**
   * オンにしたらどうなるか（ひとこと）
   */
  text?: string
  /**
   * オフ・オンの見本（同じ Seed で作った画像）。見本がないオプションは渡さない
   */
  example?: {
    offImageUrl: string
    onImageUrl: string
    alt: string
  }
  /**
   * コインの変化（例: コインは変わりません）
   */
  coin?: string
  /**
   * 時間の変化（例: 少し時間がかかります）
   */
  time?: string
  className?: string
}

/**
 * 生成のオプションの説明（オンにしたらどうなるか・見本・コインと時間）
 */
export function GenerationOptionExplanation(props: Props) {
  const t = useTranslation()

  return (
    <div className={cn("space-y-2", props.className)}>
      {props.text && (
        <p className="text-muted-foreground text-xs leading-relaxed">
          {props.text}
        </p>
      )}
      {props.example && (
        <div className="grid max-w-[360px] grid-cols-2 gap-1.5">
          <OptionExampleImage
            imageUrl={props.example.offImageUrl}
            alt={`${props.example.alt}（${t("オフ", "Off")}）`}
            label={t("オフ", "Off")}
          />
          <OptionExampleImage
            imageUrl={props.example.onImageUrl}
            alt={`${props.example.alt}（${t("オン", "On")}）`}
            label={t("オン", "On")}
            isOn
          />
        </div>
      )}
      {(props.coin || props.time) && (
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {props.coin && (
            <li className="flex items-center gap-1">
              <CoinsIcon className="size-3.5 shrink-0" />
              {props.coin}
            </li>
          )}
          {props.time && (
            <li className="flex items-center gap-1">
              <ClockIcon className="size-3.5 shrink-0" />
              {props.time}
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

function OptionExampleImage(props: {
  imageUrl: string
  alt: string
  label: string
  isOn?: boolean
}) {
  return (
    <figure className="relative overflow-hidden rounded-lg border bg-muted">
      <img
        src={props.imageUrl}
        alt={props.alt}
        width={300}
        height={200}
        className="aspect-[3/2] w-full object-cover"
        draggable={false}
        loading="lazy"
      />
      <figcaption
        className={cn(
          "absolute bottom-1 left-1 rounded px-1.5 py-0.5 font-semibold text-[10px] leading-none shadow-xs",
          props.isOn
            ? "bg-fuchsia-600 text-white dark:bg-fuchsia-500"
            : "bg-background/90 text-foreground",
        )}
      >
        {props.label}
      </figcaption>
    </figure>
  )
}
