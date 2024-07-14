import {} from "@/_components/ui/radio-group"
import { Card, CardContent } from "@/_components/ui/card"
import { ExpansionTransition } from "@/_components/expansion-transition"
import { Button } from "@/_components/ui/button"
import { PostFormItemCaption } from "@/routes/($lang)._main.new.image/_components/post-form-item-caption"
import { PostFormItemTitle } from "@/routes/($lang)._main.new.image/_components/post-form-item-title"
import { useState } from "react"

type Props = {
  onChangeTitle: (title: string) => void
  onChangeCaption: (caption: string) => void
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
            />
            <PostFormItemCaption
              label={"キャプション"}
              setCaption={props.onChangeCaption}
            />
          </div>
        </ExpansionTransition>
      </CardContent>
    </Card>
  )
}
