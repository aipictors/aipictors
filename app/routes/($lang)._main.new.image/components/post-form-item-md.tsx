import { Card, CardContent } from "~/components/ui/card"
import TextEditor from "~/routes/($lang)._main.new.image/components/text-editor"

type Props = {
  label?: string
  onChange: (value: string) => void
  value?: string
}

/**
 * タイトル入力
 */
export function PostFormItemMd (props: Props) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">
          {props.label ? props.label : "本文"}
        </p>
        <TextEditor
          value={props.value ?? ""}
          onChange={(value) => props.onChange(value)}
        />
        <p className="text-muted-foreground text-xs">
          ルビは「|漢字《かんじ》」、傍点は「《《強調》》」。「[改ページ]」だけの行を入れると、本のように読む画面でそこから次のページになります（作品ページには表示されません）
        </p>
      </CardContent>
    </Card>
  )
}
