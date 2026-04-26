import { Checkbox } from "~/components/ui/checkbox"
import { Card, CardContent } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  titles: { date: string; title: string; note?: string | null }[] | null
  isChecked?: boolean
  onChange: (value: boolean) => void
  isLoading?: boolean
  targetDate: string // yyyy-mm-dd
}

/**
 * お題入力
 */
export function PostFormItemTheme (props: Props) {
  if (!props.titles) {
    return null
  }

  // Extract the title(s) that match the target date
  const matchingThemes = props.titles.filter((item) => item.date === props.targetDate)
  const matchingTitles = matchingThemes.map((item) => item.title)
  const matchingNotes = matchingThemes
    .map((item) => item.note?.trim())
    .filter((note): note is string => Boolean(note))

  if (matchingTitles.length === 0) {
    return null
  }

  const t = useTranslation()

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">{t("お題参加", "Join the theme")}</p>
        <div className="flex items-center space-x-2">
          <Checkbox
            onCheckedChange={(value: boolean) => {
              props.onChange(value)
            }}
            id="theme"
            checked={props.isChecked}
          />
          <label className="text-sm" htmlFor="theme">
            {t(
              `お題「${matchingTitles.join(", ")}」に参加する`,
              `Join the theme "${matchingTitles.join(", ")}"`,
            )}
          </label>
        </div>
        {matchingNotes.length > 0 && (
          <div className="rounded-md border border-border/50 bg-muted/35 px-3 py-2 text-muted-foreground text-xs leading-5">
            <p className="mb-1 font-medium text-[11px] uppercase tracking-[0.12em] opacity-70">
              {t("備考", "Note")}
            </p>
            {matchingNotes.map((note, index) => (
              <p key={`${props.targetDate}-${index}`}>{note}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
