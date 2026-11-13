import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { StarIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  onChange(value: number): void
  defaultValue?: number
}

/**
 * お気に入り（星の数）で絞る
 */
export function GenerationTaskRatingSelect (props: Props) {
  const t = useTranslation()

  return (
    <Select
      onValueChange={(value: string) => {
        props.onChange(Number.parseInt(value))
      }}
      defaultValue={props.defaultValue?.toString()}
    >
      <SelectTrigger
        className="h-9 w-auto gap-1"
        title={t("お気に入り（星の数）で絞る", "Filter by star rating")}
        aria-label={t("お気に入り（星の数）で絞る", "Filter by star rating")}
      >
        <StarIcon className="w-4 shrink-0" />
        <SelectValue placeholder={t("すべて", "All")} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="-1">{t("すべて", "All")}</SelectItem>
          <SelectItem value="0">{t("星なし", "No stars")}</SelectItem>
          <SelectItem value="1">★1</SelectItem>
          <SelectItem value="2">★2</SelectItem>
          <SelectItem value="3">★3</SelectItem>
          <SelectItem value="4">★4</SelectItem>
          <SelectItem value="5">★5</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
