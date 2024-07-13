import {} from "@/_components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select"
import type { AiModel } from "@/routes/($lang)._main.new.image/_types/model"

type Props = {
  model: string | null
  models: AiModel[]
  setModel: (value: string) => void
}

/**
 * モデル入力
 */
export const ModelInput = (props: Props) => {
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
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-white pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
        <div className="mt-2 flex flex-col">
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
        </div>
      </div>
    </>
  )
}
