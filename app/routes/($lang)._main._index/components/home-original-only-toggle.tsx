import { useId } from "react"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { Switch } from "~/components/ui/switch"
import { useTranslation } from "~/hooks/use-translation"
import { useHomeOriginalOnly } from "~/routes/($lang)._main._index/hooks/use-original-only"

/**
 * ホームのタブの横の「オリジナルのみ」（二次創作を見たくない人向け。タグで判定する）
 */
export function HomeOriginalOnlyToggle() {
  const t = useTranslation()
  const id = useId()
  const { isOriginalOnly, setIsOriginalOnly } = useHomeOriginalOnly()

  return (
    <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
      <Switch
        id={id}
        checked={isOriginalOnly}
        onCheckedChange={setIsOriginalOnly}
        aria-label={t("オリジナルのみ", "Originals only")}
      />
      <label
        htmlFor={id}
        className="cursor-pointer whitespace-nowrap font-medium text-xs"
      >
        {t("オリジナルのみ", "Originals only")}
      </label>
      <CrossPlatformTooltip
        text={t(
          "「オリジナル」「オリキャラ」「創作」などのタグが付いた作品だけを表示します。タグが付いていないオリジナル作品は出ません。\n新着・人気・新規ユーザ・おすすめ・フォロー中に効きます（ホームの欄・ランキング・お気に入りタグは対象外）",
          'Shows only works tagged "オリジナル" (original), "オリキャラ" (original character), "創作" and similar. Original works without these tags are not shown.\nApplies to New, Popular, New users, For you and Following (not to the Home sections, Ranking or Favorite tags)',
        )}
      />
    </div>
  )
}

/**
 * 「オリジナルのみ」が効かない欄に出す小さな案内（オンのときだけ）
 */
export function HomeOriginalOnlyNotice(props: { text: string }) {
  const { isOriginalOnly } = useHomeOriginalOnly()
  if (!isOriginalOnly) return null
  return (
    <p className="pt-1 text-right text-muted-foreground text-xs">
      {props.text}
    </p>
  )
}
