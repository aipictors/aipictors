import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select"
import { ImagesIcon } from "lucide-react"

type Props = {
  selectedCount: number
  onChange(count: number): void
  pass: string
}

export function GenerationCountSelect(props: Props) {
  return (
    <Select
      onValueChange={(value) => {
        props.onChange(parseInt(value))
      }}
    >
      <SelectTrigger className="w-16 mr-2">
        <Button className="w-16" variant={"ghost"} size={"icon"}>
          <ImagesIcon className="w-4 mr-2" />
          {props.selectedCount}
        </Button>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{"枚数変更"}</SelectLabel>
          <SelectItem value="1">{"1"}</SelectItem>
          {props.pass === "STANDARD" ||
            (props.pass === "PREMIUM" && (
              <SelectItem value="2">{"2"}</SelectItem>
            ))}
          {props.pass === "PREMIUM" && <SelectItem value="3">{"3"}</SelectItem>}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
