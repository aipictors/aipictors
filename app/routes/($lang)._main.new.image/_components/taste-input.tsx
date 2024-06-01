import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select"
import type { ImageStyle } from "@/_graphql/__generated__/graphql"

type Props = {
  imageStyle: ImageStyle
  setImageStyle: (value: ImageStyle) => void
}

/**
 * テイスト入力
 */
export const TasteInput = (props: Props) => {
  return (
    <>
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-white pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
        <div className="mt-2 flex flex-col">
          <p className="mt-1 mb-1 font-bold text-sm">テイスト</p>
          <Select
            value={props.imageStyle}
            onValueChange={(value) => {
              props.setImageStyle(value as ImageStyle)
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
      </div>
    </>
  )
}
