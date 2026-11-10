import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent } from "~/components/ui/card"
import { ExpansionTransition } from "~/components/expansion-transition"
import { Button } from "~/components/ui/button"
import { PostFormItemCaption } from "~/routes/($lang)._main.new.image/components/post-form-item-caption"
import { PostFormItemTitle } from "~/routes/($lang)._main.new.image/components/post-form-item-title"
import { useTranslation } from "~/hooks/use-translation"
import { translateText } from "~/utils/translate-text"

type Props = {
  onChangeTitle: (title: string) => void
  onChangeCaption: (caption: string) => void
  title?: string
  caption?: string
  /** 翻訳元の日本語のタイトル */
  sourceTitle?: string
  /** 翻訳元の日本語のキャプション */
  sourceCaption?: string
}

/**
 * 公開モード入力
 */
export function PostFormItemEnglish (props: Props) {
  const t = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [enTitle, setEnTitle] = useState(props.title || "")
  const [enCaption, setEnCaption] = useState(props.caption || "")
  const [isTranslating, setIsTranslating] = useState(false)

  // propsの変更を内部状態に反映
  useEffect(() => {
    setEnTitle(props.title || "")
  }, [props.title])

  useEffect(() => {
    setEnCaption(props.caption || "")
  }, [props.caption])

  const handleTranslate = async () => {
    const sourceTitle = props.sourceTitle?.trim() ?? ""
    const sourceCaption = props.sourceCaption?.trim() ?? ""
    if (!sourceTitle && !sourceCaption) {
      toast(
        t(
          "翻訳する日本語のタイトルかキャプションを入力してください",
          "Please enter a Japanese title or caption to translate",
        ),
      )
      return
    }

    setIsTranslating(true)
    try {
      const translate = (text: string) =>
        text
          ? translateText({
              text,
              sourceLanguage: "ja",
              targetLanguage: "en",
            })
          : Promise.resolve("")
      const [translatedTitle, translatedCaption] = await Promise.all([
        translate(sourceTitle),
        translate(sourceCaption),
      ])

      // 翻訳に失敗した欄は、入力済みの英語を消さない
      if (translatedTitle) {
        setEnTitle(translatedTitle)
        props.onChangeTitle(translatedTitle)
      }
      if (translatedCaption) {
        setEnCaption(translatedCaption)
        props.onChangeCaption(translatedCaption)
      }
      if (
        (sourceTitle && !translatedTitle) ||
        (sourceCaption && !translatedCaption)
      ) {
        toast(t("翻訳に失敗しました", "Failed to translate"))
      }
    } catch (error) {
      console.error("Translation error:", error)
      toast(t("翻訳に失敗しました", "Failed to translate"))
    }
    setIsTranslating(false)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <ExpansionTransition
          triggerChildren={
            <Button variant={"secondary"} className="w-full">
              {isExpanded
                ? t("英語バージョンを閉じる", "Close English Version")
                : t("英語バージョンを編集する", "Edit English Version")}
            </Button>
          }
          onExpandChange={setIsExpanded}
        >
          <div className="space-y-4 pt-4">
            <Button
              variant={"secondary"}
              className="w-full"
              onClick={handleTranslate}
              disabled={isTranslating}
            >
              {isTranslating
                ? t("翻訳中...", "Translating...")
                : t("日本語翻訳", "Translate to English")}
            </Button>
            <PostFormItemTitle
              label={t("タイトル", "Title")}
              onChange={(value) => {
                setEnTitle(value)
                props.onChangeTitle(value)
              }}
              value={enTitle}
            />
            <PostFormItemCaption
              label={t("キャプション", "Caption")}
              setCaption={(value) => {
                setEnCaption(value)
                props.onChangeCaption(value)
              }}
              caption={enCaption}
            />
          </div>
        </ExpansionTransition>
      </CardContent>
    </Card>
  )
}
