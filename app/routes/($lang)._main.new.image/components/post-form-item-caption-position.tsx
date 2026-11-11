import { useId } from "react"
import { Card, CardContent } from "~/components/ui/card"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  isCaptionBeforeBody: boolean
  onChange: (value: boolean) => void
}

/**
 * 小説・コラムのキャプションを本文の前（前書き）に出すか。オフのときは今までどおり本文の後
 */
export function PostFormItemCaptionPosition(props: Props) {
  const t = useTranslation()
  const id = useId()

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="space-y-1">
          <Label htmlFor={id} className="font-bold text-sm">
            {t(
              "キャプションを本文の前に表示する",
              "Show the caption before the text",
            )}
          </Label>
          <p className="text-muted-foreground text-xs">
            {t(
              "前書きや注意書きとして、本文より先に読んでもらえます。オフのときは本文の後（後書き）に表示されます",
              "Readers see it first, like a foreword or a content note. When off, it appears after the text.",
            )}
          </p>
        </div>
        <Switch
          id={id}
          checked={props.isCaptionBeforeBody}
          onCheckedChange={props.onChange}
        />
      </CardContent>
    </Card>
  )
}
