import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select"
import type { AiModel } from "@/routes/($lang)._main.new.image/_types/model"
import { Card, CardContent } from "@/_components/ui/card"

type Props = {
  model: string | null
  models: AiModel[]
  setModel: (value: string) => void
}

/**
 * モデル入力
 */
export const PostFormItemModel = (props: Props) => {
  // モデル名で並び替え
  const displayModels = props.models.sort((a, b) => {
    if (a.name < b.name) {
      return -1
    }
    if (a.name > b.name) {
      return 1
    }
    return 0
  })

  return (
    <>
      <Card>
        <CardContent className="flex flex-col">
          <p className="mt-1 mb-1 font-bold text-sm">使用AI</p>
          <Select
            value={props.model ?? ""}
            onValueChange={(value) => {
              props.setModel(value)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {displayModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </>
  )
}
