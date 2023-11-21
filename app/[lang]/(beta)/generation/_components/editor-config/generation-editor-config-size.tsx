import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  value: string
  onChange(value: string): void
}

export const GenerationEditorConfigSize = (props: Props) => {
  return (
    <div className="flex flex-col gap-y-4">
      <span className="font-bold">{"サイズ"}</span>
      <Select
        value={props.value}
        onValueChange={(value) => {
          props.onChange(value)
        }}
      >
        <SelectGroup>
          <SelectTrigger>
            <SelectValue placeholder="【正方形】768×768(upscale:1.5)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={"SD1_512_512"}>
              {"【正方形】768×768(upscale:1.5)"}
            </SelectItem>
            <SelectItem value={"SD1_512_768"}>
              {"【縦長】768×1200(upscale:1.5)"}
            </SelectItem>
            <SelectItem value={"SD1_768_512"}>
              {"【横長】1200×768(upscale:1.5)"}
            </SelectItem>
            {/* <SelectItem value={"SD2_768_768"}>
              {"【正方形】768×768(upscale:1.5)"}
            </SelectItem>
            <SelectItem value={"SD2_768_1200"}>
              {"【縦長】768×1200(upscale:1.5)"}
            </SelectItem>
            <SelectItem value={"SD2_1200_768"}>
              {"【横長】1200×768(upscale:1.5)"}
            </SelectItem> */}
          </SelectContent>
        </SelectGroup>
      </Select>
    </div>
  )
}
