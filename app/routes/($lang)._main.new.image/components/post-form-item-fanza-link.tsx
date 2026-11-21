import { Card, CardContent } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  url: string | null | undefined
  rating: string
  onChange: (value: string) => void
}

/**
 * FANZA の販売ページの URL（R18・R18G の作品のページに「FANZA で販売中」のボタンを出す）
 * 全年齢の作品には出さないので、年齢制限が R18 のときだけ入力欄を出す
 */
export function PostFormItemFanzaLink(props: Props) {
  const t = useTranslation()

  if (props.rating !== "R18" && props.rating !== "R18G") {
    return null
  }

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">
          {t("FANZA で販売中", "On sale at FANZA")}
        </p>
        <p className="text-muted-foreground text-xs">
          {t(
            "この作品を FANZA で販売していれば、販売ページの URL を入れると作品のページにボタンを出します",
            "If you sell this work on FANZA, enter the product page URL to show a button on the work page",
          )}
        </p>
        <Input
          onChange={(event) => {
            props.onChange(event.target.value)
          }}
          value={props.url ?? ""}
          maxLength={500}
          type="url"
          inputMode="url"
          placeholder={"https://www.dmm.co.jp/dc/doujin/-/detail/=/cid=..."}
          className="w-full"
        />
      </CardContent>
    </Card>
  )
}
