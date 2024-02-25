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
  value: number
  onChange(value: number): void
}

/**
 * 枚数指定
 * @param props
 * @returns
 */
export function GenerationTaskCountSelect(props: Props) {
  return (
    <Select
      value={props.value.toString()}
      onValueChange={(value: string) => {
        props.onChange(value === "" ? 50 : parseInt(value, 10))
      }}
    >
      <SelectTrigger className="w-16">
        <SelectValue placeholder="枚数" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{"枚数選択"}</SelectLabel>
          <SelectItem value="50">{"50"}</SelectItem>
          <SelectItem value="100">{"100"}</SelectItem>
          <SelectItem value="200">{"200"}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
