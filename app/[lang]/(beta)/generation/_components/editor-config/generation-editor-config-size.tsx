import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  modelType: string
  value: string
  onChange(value: string): void
}

export const GenerationEditorConfigSize = (props: Props) => {
  return (
    <div className="flex flex-col gap-y-4">
      <span className="font-bold">{"サイズ"}</span>
      <Select value={props.value} onValueChange={props.onChange}>
        <SelectGroup>
          <SelectTrigger>
            <SelectValue placeholder="サイズ" />
          </SelectTrigger>
          <SelectContent>
            {props.modelType === "SD1" && (
              <SelectItem value={"SD1_512_512"}>
                {"【正方形】512x512(upscale:1.5)"}
              </SelectItem>
            )}
            {props.modelType === "SD1" && (
              <SelectItem value={"SD1_512_768"}>
                {"【縦長】512x768(upscale:1.5)"}
              </SelectItem>
            )}
            {props.modelType === "SD1" && (
              <SelectItem value={"SD1_768_512"}>
                {"【横長】768x512(upscale:1.5)"}
              </SelectItem>
            )}
            {props.modelType === "SD2" && (
              <SelectItem value={"SD2_768_768"}>
                {"【正方形】768×768(upscale:1.5)"}
              </SelectItem>
            )}
            {props.modelType === "SD2" && (
              <SelectItem value={"SD2_768_1200"}>
                {"【縦長】768×1200(upscale:1.5)"}
              </SelectItem>
            )}
            {props.modelType === "SD2" && (
              <SelectItem value={"SD2_1200_768"}>
                {"【横長】1200×768(upscale:1.5)"}
              </SelectItem>
            )}
          </SelectContent>
        </SelectGroup>
      </Select>
    </div>
  )
}
