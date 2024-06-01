import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select"
import { StarIcon } from "lucide-react"

type Props = {
  onChange(value: number): void
  defaultValue?: number
}

/**
 * お気に入り
 */
export function GenerationTaskRatingSelect(props: Props) {
  return (
    <Select
      onValueChange={(value: string) => {
        props.onChange(Number.parseInt(value))
      }}
      defaultValue={props.defaultValue?.toString()}
    >
      <SelectTrigger className="w-24" title="お気に入り度で絞る">
        <StarIcon className="w-4" />
        <SelectValue placeholder="-" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="-1">-</SelectItem>
          <SelectItem value="0">0</SelectItem>
          <SelectItem value="1">1</SelectItem>
          <SelectItem value="2">2</SelectItem>
          <SelectItem value="3">3</SelectItem>
          <SelectItem value="4">4</SelectItem>
          <SelectItem value="5">5</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
