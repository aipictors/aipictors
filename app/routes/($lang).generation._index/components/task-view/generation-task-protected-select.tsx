import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { LockKeyholeIcon } from "lucide-react"

type Props = {
  onChange(value: number): void
  defaultValue?: number
}

/**
 * 保護
 */
export function GenerationTaskProtectedSelect(props: Props) {
  return (
    <Select
      onValueChange={(value: string) => {
        props.onChange(Number.parseInt(value))
      }}
      defaultValue={props.defaultValue?.toString()}
    >
      <SelectTrigger
        className="w-32"
        title="履歴の保存期間を過ぎても保護扱い中の履歴を絞る"
      >
        <LockKeyholeIcon className="w-4" />
        {"永久保管"}
        <SelectValue placeholder="-" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="-1">-</SelectItem>
          <SelectItem value="0">無</SelectItem>
          <SelectItem value="1">有</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
