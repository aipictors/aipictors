import {} from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { ExpansionTransition } from "@/components/expansion-transition"
import { Button } from "@/components/ui/button"
import { PostFormItemCaption } from "@/routes/($lang)._main.new.image/components/post-form-item-caption"
import { PostFormItemTitle } from "@/routes/($lang)._main.new.image/components/post-form-item-title"
import { useState } from "react"

type Props = {
  onChangeTitle: (title: string) => void
  onChangeCaption: (caption: string) => void
  title?: string
  caption?: string
}

/**
 * 公開モード入力
 */
export const PostFormItemEnglish = (props: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card>
      <CardContent className="p-4">
        <ExpansionTransition
          triggerChildren={
            <Button variant={"secondary"} className="w-full">
              {"英語バージョン"}
              {isExpanded ? "を閉じる" : "を編集する"}
            </Button>
          }
          onExpandChange={setIsExpanded}
        >
          <div className="space-y-4 pt-4">
            <PostFormItemTitle
              label={"タイトル"}
              onChange={props.onChangeTitle}
              value={props.title}
            />
            <PostFormItemCaption
              label={"キャプション"}
              setCaption={props.onChangeCaption}
              caption={props.caption}
            />
          </div>
        </ExpansionTransition>
      </CardContent>
    </Card>
  )
}
