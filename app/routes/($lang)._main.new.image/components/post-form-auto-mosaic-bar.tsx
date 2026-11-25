import {
  AlertTriangleIcon,
  Loader2Icon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react"
import { useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Slider } from "~/components/ui/slider"
import { Switch } from "~/components/ui/switch"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import type { usePostAutoMosaic } from "~/routes/($lang)._main.new.image/hooks/use-post-auto-mosaic"
import {
  hasMosaicStrength,
  MOSAIC_STRENGTH_MAX,
  MOSAIC_STRENGTH_MIN,
  type MosaicStyle,
  preloadAutoMosaic,
} from "~/utils/auto-mosaic"

type Props = {
  mosaic: ReturnType<typeof usePostAutoMosaic>
}

/**
 * 投稿画面（R18 / R18G）: 自動モザイクの状態と、まとめての種類・濃さ、「自分でかけ済み」の切り替え
 * 検出は投稿者のブラウザの中で動く（サーバーは使わない）
 */
export function PostFormAutoMosaicBar(props: Props) {
  const t = useTranslation()
  const { summary, settings, isSelfApplied } = props.mosaic

  // 帯が出たら（R18 の投稿）検出の部品を先に読んでおく
  useEffect(() => {
    preloadAutoMosaic()
  }, [])

  const styles: { value: MosaicStyle; label: string }[] = [
    { value: "mosaic", label: t("モザイク", "Mosaic") },
    { value: "black", label: t("黒線", "Black") },
    { value: "white", label: t("白抜き", "White") },
    { value: "blur", label: t("ぼかし", "Blur") },
  ]

  const isBusy = summary.pending > 0 || props.mosaic.isRendering
  const hasWarning = isSelfApplied && summary.warning > 0

  const status = () => {
    if (summary.pending > 0) {
      return t(
        `画像を確認しています（残り${summary.pending}枚）`,
        `Checking images (${summary.pending} left)`,
      )
    }
    if (isSelfApplied) {
      return hasWarning
        ? t(
            `${summary.warning}枚で、性器などが隠れていないように見える所があります。⚠の画像を確かめてください`,
            `${summary.warning} image(s) may have uncensored areas. Please check the images marked ⚠`,
          )
        : t(
            "隠れていない所は見つかりませんでした",
            "No uncensored areas were found",
          )
    }
    return summary.applied > 0
      ? t(
          `${summary.total}枚中${summary.applied}枚にモザイクをかけました。下のプレビューで確かめて、直したい画像は鉛筆ボタンから（範囲の追加・削除、種類、濃さ）`,
          `Mosaic applied to ${summary.applied} of ${summary.total} image(s). Check the preview below and use the pencil button to adjust`,
        )
      : t(
          "モザイクが必要な所は見つかりませんでした。必要なら鉛筆ボタンから手でかけてください",
          "Nothing to mosaic was found. Use the pencil button if needed",
        )
  }

  return (
    <div
      className={cn(
        "mx-2 mb-3 rounded-xl border px-3 py-2.5 text-white",
        hasWarning
          ? "border-amber-500/60 bg-amber-500/15"
          : "border-emerald-500/40 bg-emerald-500/10",
      )}
    >
      <div className="flex items-start gap-2.5">
        {hasWarning ? (
          <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-amber-400" />
        ) : (
          <ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-emerald-400" />
        )}
        <div className="min-w-0 flex-1 text-xs leading-5">
          <p className="font-bold text-sm">
            {isSelfApplied
              ? t(
                  "自分でかけたモザイクのまま投稿します",
                  "Posting with your own mosaic",
                )
              : t(
                  "R18 作品は自動でモザイクがかかります",
                  "R18 works are mosaicked automatically",
                )}
          </p>
          <p className="flex items-center gap-1 text-zinc-200">
            {isBusy && (
              <Loader2Icon className="size-3.5 shrink-0 animate-spin" />
            )}
            {status()}
          </p>
          {!isSelfApplied && (
            <p className="text-zinc-400">
              {t(
                "性器・肛門を見つけて形に沿ってかけます（乳首は対象外・GIF は対象外）。自動でかけた作品を、モザイクの不足を理由に運営が非公開にすることは基本的にありません。",
                "Genitals and anus are detected and covered along their shape (not nipples or GIFs). Works mosaicked automatically are generally not hidden for insufficient mosaic.",
              )}
            </p>
          )}
        </div>
      </div>

      {!isSelfApplied && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <div
            className="flex shrink-0 rounded-full bg-black/30 p-0.5"
            role="group"
            aria-label={t("隠し方", "Style")}
          >
            {styles.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={settings.style === item.value}
                disabled={props.mosaic.isRendering}
                onClick={() =>
                  void props.mosaic.changeSettings({
                    ...settings,
                    style: item.value,
                  })
                }
                className={cn(
                  "h-8 rounded-full px-3 text-xs transition-colors",
                  settings.style === item.value
                    ? "bg-white font-bold text-zinc-900"
                    : "text-zinc-200 hover:text-white",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          {hasMosaicStrength(settings.style) && (
            <div className="flex min-w-40 flex-1 items-center gap-2">
              <span className="shrink-0 text-xs text-zinc-300">
                {t("濃さ", "Strength")}
              </span>
              <Slider
                // 動かしている間は数字だけ変え、離したときに描き直す
                key={settings.style}
                defaultValue={[settings.strength]}
                onValueCommit={(value) =>
                  void props.mosaic.changeSettings({
                    ...settings,
                    strength: value[0],
                  })
                }
                disabled={props.mosaic.isRendering}
                aria-label={t("濃さ", "Strength")}
                min={MOSAIC_STRENGTH_MIN}
                max={MOSAIC_STRENGTH_MAX}
                step={1}
                className="flex-1"
              />
            </div>
          )}
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-white/10 border-t pt-2">
        <div className="flex items-center gap-2 text-xs">
          <Switch
            id="post-mosaic-self-applied"
            checked={isSelfApplied}
            onCheckedChange={props.mosaic.setIsSelfApplied}
            aria-label={t(
              "自分でモザイクをかけ済み",
              "I already added my own mosaic",
            )}
          />
          <label htmlFor="post-mosaic-self-applied" className="cursor-pointer">
            {t(
              "自分でモザイクをかけ済み（自動でかけない）",
              "I already added my own mosaic (don't apply automatically)",
            )}
          </label>
        </div>
        {hasWarning && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            disabled={isBusy}
            onClick={() => void props.mosaic.applyToWarnings()}
          >
            <SparklesIcon className="mr-1 size-4" />
            {t("⚠の画像に自動でかける", "Apply to images marked ⚠")}
          </Button>
        )}
      </div>
      {isSelfApplied && !hasWarning && (
        <p className="mt-1 text-[11px] text-zinc-400 leading-4">
          {t(
            "自動ではかけませんが、念のため画像を確認し、隠れていない所が見つかったらお知らせします。",
            "No automatic mosaic, but images are still checked and you'll be warned about uncensored areas.",
          )}
        </p>
      )}
    </div>
  )
}
