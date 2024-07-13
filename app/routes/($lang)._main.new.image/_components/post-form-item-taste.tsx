import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { Card } from "@/_components/ui/card"

type Props = {
  imageStyle: IntrospectionEnum<"ImageStyle">
  setImageStyle: (value: IntrospectionEnum<"ImageStyle">) => void
}

/**
 * テイスト入力
 */
export const PostFormItemTaste = (props: Props) => {
  return (
    <>
      <Card className="p-1">
        <div className="mt-2 flex flex-col">
          <p className="mt-1 mb-1 font-bold text-sm">テイスト</p>
          <Select
            value={props.imageStyle}
            onValueChange={(value) => {
              props.setImageStyle(value as IntrospectionEnum<"ImageStyle">)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full">
              <SelectItem value={"ILLUSTRATION"}>{"イラスト"}</SelectItem>
              <SelectItem value={"SEMI_REAL"}>{"セミリアル"}</SelectItem>
              <SelectItem value={"REAL"}>{"リアル"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
    </>
  )
}
