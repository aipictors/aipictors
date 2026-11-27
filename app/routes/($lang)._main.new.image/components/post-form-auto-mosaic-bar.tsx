import {
  Loader2Icon,
  ShieldCheckIcon,
  SparklesIcon,
  Undo2Icon,
} from "lucide-react"
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
} from "~/utils/auto-mosaic"

type Props = {
  mosaic: ReturnType<typeof usePostAutoMosaic>
  /** 年齢種別が R18 / R18G */
  isR18: boolean
  /** おすすめの年齢種別を反映する */
  onSuggestRating?: (rating: "R18") => void
}

const buttonClassName =
  "h-8 rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"

/**
 * 投稿画面: 自動モザイク・年齢種別の「おすすめ」
 * 自動ではかけず、年齢種別も変えない。押したときだけ反映する（検出は投稿者のブラウザの中で動く）
 * - 全年齢・R15: はっきり写っていそうな画像があれば「R-18 がおすすめ」
 * - R18 / R18G: モザイクが必要そうな画像があれば「おすすめのモザイクをかける」。かけた後は種類・濃さ・外す
 */
export function PostFormAutoMosaicBar(props: Props) {
  const t = useTranslation()
  const { summary, settings } = props.mosaic

  if (!props.isR18) {
    if (summary.sensitive === 0 || props.mosaic.isRatingSuggestionDismissed) {
      return null
    }
    return (
      <div className="mx-2 mb-3 rounded-xl border border-sky-500/50 bg-sky-500/10 px-3 py-2.5 text-white">
        <div className="flex items-start gap-2.5">
          <SparklesIcon className="mt-0.5 size-5 shrink-0 text-sky-300" />
          <div className="min-w-0 flex-1 text-xs leading-5">
            <p className="font-bold text-sm">
              {t("おすすめ: 年齢種別「R-18」", "Suggestion: age rating “R-18”")}
            </p>
            <p className="text-zinc-200">
              {t(
                `${summary.sensitive}枚に、モザイクが必要な部分が写っているかもしれません。`,
                `${summary.sensitive} image(s) may show areas that need a mosaic.`,
              )}
            </p>
            <p className="text-zinc-400">
              {t(
                "自動の判定なので、見間違えることがあります。問題なければこのまま投稿できます。",
                "This is an automatic check and can be wrong. If everything is fine, you can post as is.",
              )}
            </p>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className={buttonClassName}
            onClick={props.mosaic.dismissRatingSuggestion}
          >
            {t("このままにする", "Keep current rating")}
          </Button>
          <Button
            size="sm"
            className="h-8 rounded-full"
            onClick={() => props.onSuggestRating?.("R18")}
          >
            {t("R-18 にする", "Change to R-18")}
          </Button>
        </div>
      </div>
    )
  }

  const styles: { value: MosaicStyle; label: string }[] = [
    { value: "mosaic", label: t("モザイク", "Mosaic") },
    { value: "black", label: t("黒線", "Black") },
    { value: "white", label: t("白抜き", "White") },
    { value: "blur", label: t("ぼかし", "Blur") },
  ]

  const isBusy = summary.pending > 0 || props.mosaic.isRendering
  const hasSuggestion = summary.suggested > 0
  const hasApplied = summary.applied > 0

  const title = () => {
    if (hasSuggestion) {
      return t(
        `おすすめ: ${summary.suggested}枚にモザイク`,
        `Suggestion: mosaic on ${summary.suggested} image(s)`,
      )
    }
    if (hasApplied) {
      return t(
        `${summary.applied}枚にモザイクをかけています`,
        `Mosaic on ${summary.applied} image(s)`,
      )
    }
    return t("モザイクのおすすめ", "Mosaic suggestions")
  }

  const status = () => {
    if (summary.pending > 0) {
      return t(
        `画像を確認しています（残り${summary.pending}枚）`,
        `Checking images (${summary.pending} left)`,
      )
    }
    if (hasSuggestion) {
      return t(
        "モザイクが必要そうな所が見つかりました。押すとかかり、下のプレビューで確かめて鉛筆ボタンから直せます（範囲の追加・削除、種類、濃さ）。",
        "Areas that may need a mosaic were found. Press to apply, then check the preview and adjust with the pencil button.",
      )
    }
    if (hasApplied) {
      return t(
        "下のプレビューで確かめて、直したい画像は鉛筆ボタンから（範囲の追加・削除、種類、濃さ）。",
        "Check the preview below and use the pencil button to adjust.",
      )
    }
    return t(
      "モザイクが必要そうな所は見つかりませんでした。必要なら鉛筆ボタンから自分でかけてください。",
      "Nothing that seems to need a mosaic was found. Use the pencil button if needed.",
    )
  }

  return (
    <div
      className={cn(
        "mx-2 mb-3 rounded-xl border px-3 py-2.5 text-white",
        hasSuggestion
          ? "border-sky-500/50 bg-sky-500/10"
          : "border-white/15 bg-white/5",
      )}
    >
      <div className="flex items-start gap-2.5">
        {hasSuggestion ? (
          <SparklesIcon className="mt-0.5 size-5 shrink-0 text-sky-300" />
        ) : (
          <ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-emerald-400" />
        )}
        <div className="min-w-0 flex-1 text-xs leading-5">
          <p className="font-bold text-sm">{title()}</p>
          <p className="flex items-center gap-1 text-zinc-200">
            {isBusy && (
              <Loader2Icon className="size-3.5 shrink-0 animate-spin" />
            )}
            {status()}
          </p>
          {hasSuggestion && (
            <p className="text-zinc-400">
              {t(
                "自動の判定なので、見間違えることがあります。自分でかけ済みなら、そのままで大丈夫です。",
                "This is an automatic check and can be wrong. If you already added your own mosaic, you can leave it.",
              )}
            </p>
          )}
        </div>
      </div>

      {(hasSuggestion || summary.autoApplied > 0) && (
        <div className="mt-2 flex flex-wrap justify-end gap-2">
          {summary.autoApplied > 0 && (
            <Button
              size="sm"
              variant="outline"
              className={buttonClassName}
              disabled={props.mosaic.isRendering}
              onClick={props.mosaic.removeAutoMosaic}
            >
              <Undo2Icon className="mr-1 size-4" />
              {t("おすすめのモザイクを外す", "Remove suggested mosaic")}
            </Button>
          )}
          {hasSuggestion && (
            <Button
              size="sm"
              className="h-8 rounded-full"
              disabled={isBusy}
              onClick={() => void props.mosaic.applySuggestions()}
            >
              <SparklesIcon className="mr-1 size-4" />
              {t("おすすめのモザイクをかける", "Apply suggested mosaic")}
            </Button>
          )}
        </div>
      )}

      {hasApplied && (
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

      {(hasSuggestion || hasApplied || props.mosaic.isTentacle) && (
        <div className="mt-2 flex items-start gap-2 text-xs">
          <Switch
            id="post-mosaic-tentacle"
            checked={props.mosaic.isTentacle}
            onCheckedChange={props.mosaic.setIsTentacle}
            disabled={props.mosaic.isRendering}
            aria-label={t("触手を含む作品", "Includes tentacles")}
          />
          <label
            htmlFor="post-mosaic-tentacle"
            className="cursor-pointer leading-5"
          >
            {t("触手を含む作品", "Includes tentacles")}
            <span className="block text-[11px] text-zinc-400 leading-4">
              {t(
                "触手を性器と見間違えないようにします（タグ・プロンプトに触手があると自動でオン）",
                "Keeps tentacles from being mistaken for genitals (turns on automatically when tags or the prompt mention tentacles)",
              )}
            </span>
          </label>
        </div>
      )}
    </div>
  )
}
