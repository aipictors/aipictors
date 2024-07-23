import { Card, CardContent } from "@/_components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/_components/ui/radio-group"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"

type Props = {
  type: IntrospectionEnum<"WorkType">
  setType: (value: IntrospectionEnum<"WorkType">) => void
}

/**
 * 種別入力
 */
export const PostFormItemType = (props: Props) => {
  // 大文字に変換
  const type = props.type.toUpperCase() as IntrospectionEnum<"WorkType">

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">種類</p>
        <RadioGroup
          value={type}
          onValueChange={(value) => {
            props.setType(value as IntrospectionEnum<"WorkType">)
          }}
          className="flex flex-wrap space-x-0 text-sm"
        >
          <div className="md:w-auto">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="NOVEL" id="novel-check" />
              <label htmlFor="novel-check">{"小説"}</label>
            </div>
          </div>
          <div className="w-auto">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="COLUMN" id="column-check" />
              <label htmlFor="column-check">{"コラム"}</label>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
