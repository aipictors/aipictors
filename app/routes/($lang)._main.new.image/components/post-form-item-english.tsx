import { useState, useEffect } from "react"
import { Card, CardContent } from "~/components/ui/card"
import { ExpansionTransition } from "~/components/expansion-transition"
import { Button } from "~/components/ui/button"
import { PostFormItemCaption } from "~/routes/($lang)._main.new.image/components/post-form-item-caption"
import { PostFormItemTitle } from "~/routes/($lang)._main.new.image/components/post-form-item-title"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  onChangeTitle: (title: string) => void
  onChangeCaption: (caption: string) => void
  title?: string
  caption?: string
  enTitle?: string
  enCaption?: string
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
    setIsTranslating(true)
    try {
      const translateText = async (text: string) => {
        const encodedText = encodeURIComponent(text)
        const translateURL = `https://script.google.com/macros/s/AKfycbw1D0NqYxBiJvN00CZLCnoDIpWtK_cib_JDY7sva_Mlwr-XVjabRSWDooBBvVlgZUPU/exec?text=${encodedText}&source=ja&target=en`
        const response = await fetch(translateURL)
        const data = await response.json()
        if (data.text) {
          return data.text
        }
        console.error("Translation error:", data)
        return ""
      }

      if (props.title) {
        const translatedTitle = await translateText(props.title)
        setEnTitle(translatedTitle)
        props.onChangeTitle(translatedTitle)
      }
      if (props.caption) {
        const translatedCaption = await translateText(props.caption)
        setEnCaption(translatedCaption)
        props.onChangeCaption(translatedCaption)
      }
    } catch (error) {
      console.error("Translation error:", error)
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
