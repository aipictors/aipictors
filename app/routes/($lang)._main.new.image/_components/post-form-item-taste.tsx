import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { Card, CardContent } from "@/_components/ui/card"

type Props = {
  imageStyle: IntrospectionEnum<"ImageStyle">
  setImageStyle: (value: IntrospectionEnum<"ImageStyle">) => void
}

/**
 * テイスト入力
 */
export const PostFormItemTaste = (props: Props) => {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">テイスト</p>
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
      </CardContent>
    </Card>
  )
}
