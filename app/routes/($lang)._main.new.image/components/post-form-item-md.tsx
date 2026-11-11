import { Card, CardContent } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"
import TextEditor from "~/routes/($lang)._main.new.image/components/text-editor"

type Props = {
  label?: string
  onChange: (value: string) => void
  value?: string
}

/**
 * 本文の入力
 */
export function PostFormItemMd(props: Props) {
  const t = useTranslation()

  return (
    <Card>
      <CardContent className="space-y-2 p-3 md:p-4">
        <p className="font-bold text-sm">
          {props.label ? props.label : t("本文", "Body")}
          <span className="ml-1 font-normal text-muted-foreground text-xs">
            {t("（必須）", "(required)")}
          </span>
        </p>
        <TextEditor
          value={props.value ?? ""}
          onChange={(value) => props.onChange(value)}
        />
        <details className="text-muted-foreground text-xs">
          <summary className="cursor-pointer select-none py-1">
            {t(
              "ルビ・傍点・改ページの書き方",
              "How to add ruby, emphasis and page breaks",
            )}
          </summary>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              {t(
                "ルビ：文字を選んで「ルビ」を押し、《》の中に読みを入れます（手で書くときは「｜漢字《かんじ》」）",
                "Ruby: select text, press Ruby, then type the reading inside 《》 (or write ｜漢字《かんじ》).",
              )}
            </li>
            <li>
              {t(
                "傍点：文字を選んで「傍点」を押します（手で書くときは「《《強調》》」）",
                "Emphasis dots: select text and press the button (or write 《《text》》).",
              )}
            </li>
            <li>
              {t(
                "改ページ：「［改ページ］」だけの行から、本のように読む画面で次のページになります（作品ページには表示されません）",
                "Page break: a line with only ［改ページ］ starts a new page in the book reader (hidden on the work page).",
              )}
            </li>
            <li>
              {t(
                "字下げは全角スペースで入れられます。「全画面で書く」で画面いっぱいに広げて書けます",
                "Indent with a full-width space. Use full screen to write without distractions.",
              )}
            </li>
          </ul>
        </details>
      </CardContent>
    </Card>
  )
}
