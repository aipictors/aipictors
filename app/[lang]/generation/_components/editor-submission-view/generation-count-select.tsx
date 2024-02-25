import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  selectedCount: number
  onChange(count: number): void
  pass: string
}

export function GenerationCountSelect(props: Props) {
  return (
    <Select
      value={props.selectedCount.toString()}
      onValueChange={(value) => {
        props.onChange(parseInt(value))
      }}
    >
      <SelectTrigger className="w-24 mr-2">
        <SelectValue placeholder={"枚数"} />
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
