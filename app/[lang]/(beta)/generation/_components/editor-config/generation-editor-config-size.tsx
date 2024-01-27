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
    <div className="flex flex-col gap-y-2">
      <span className="font-bold text-sm">{"サイズ"}</span>
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
            {props.modelType === "SD2" && (
              <SelectItem value={"SD2_384_960"}>
                {"【超縦長】384x960"}
              </SelectItem>
            )}
            {props.modelType === "SD2" && (
              <SelectItem value={"SD2_960_384"}>
                {"【超横長】960x384"}
              </SelectItem>
            )}
            {props.modelType === "SD3" && (
              <SelectItem value={"SD3_1024_1024"}>
                {"【正方形】1024x1024"}
              </SelectItem>
            )}
            {props.modelType === "SD3" && (
              <SelectItem value={"SD3_832_1216"}>
                {"【縦長】832x1216"}
              </SelectItem>
            )}
            {props.modelType === "SD3" && (
              <SelectItem value={"SD3_1216_832"}>
                {"【横長】1216x832"}
              </SelectItem>
            )}
            {props.modelType === "SD3" && (
              <SelectItem value={"SD3_640_1536"}>
                {"【超縦長】640x1536"}
              </SelectItem>
            )}
            {props.modelType === "SD3" && (
              <SelectItem value={"SD3_1536_640"}>
                {"【超横長】1536x640"}
              </SelectItem>
            )}
          </SelectContent>
        </SelectGroup>
      </Select>
    </div>
  )
}
