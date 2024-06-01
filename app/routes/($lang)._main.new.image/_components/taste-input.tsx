import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select"

type Props = {
  taste: string
  setTaste: (value: string) => void
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
            value={props.taste}
            onValueChange={(value) => {
              props.setTaste(value)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full">
              <SelectItem value={"illust"}>{"イラスト"}</SelectItem>
              <SelectItem value={"semiReal"}>{"セミリアル"}</SelectItem>
              <SelectItem value={"real"}>{"リアル"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )
}
