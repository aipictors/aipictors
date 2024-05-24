import { Input } from "@/_components/ui/input"

type Props = {
  onChange(count: number): void
  maxCount: number
  count: number
  disabled?: boolean
}

export function GenerationReserveCountInput(props: Props) {
  return (
    <Input
      disabled={props.disabled}
      className={"mr-2 w-16 md:w-20"}
      onChange={(e) => {
        if (Number(e.target.value) > props.maxCount) {
          props.onChange(props.maxCount)
          return
        }
        props.onChange(Number(e.target.value))
      }}
      max={props.maxCount}
      min={1}
      value={props.count}
      type="number"
      placeholder="枚数"
    />
  )
}
