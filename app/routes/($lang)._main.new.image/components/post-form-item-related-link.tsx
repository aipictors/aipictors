import { Input } from "~/components/ui/input"
import { Card, CardContent } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  link: string | null
  onChange: (value: string) => void
}

/**
 * 関連リンク入力
 */
export function PostFormItemRelatedLink (props: Props) {
  const t = useTranslation()

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">{t("関連リンク", "Related Link")}</p>
        <Input
          onChange={(event) => {
            props.onChange(event.target.value)
          }}
          value={props.link ?? ""}
          minLength={1}
          maxLength={320}
          required
          type="text"
          placeholder={"https://"}
          className="w-full"
        />
      </CardContent>
    </Card>
  )
}
