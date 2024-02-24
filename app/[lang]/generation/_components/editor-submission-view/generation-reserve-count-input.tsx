import { Input } from "@/components/ui/input"

type Props = {
  onChange(count: number): void
  maxCount: number
}

export function GenerationReserveCountInput(props: Props) {
  return (
    <Input
      className={"w-20 mr-2"}
      onChange={(value) => {
        props.onChange(Number(value))
      }}
      max={props.maxCount}
      min={1}
      value={10}
      type="number"
      placeholder="枚数"
    />
  )
}
