import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StarIcon } from "lucide-react"

type Props = {
  onChange(value: number): void
  usedRatingCount: number
  maxRatingCount: number
}

/**
 * お気に入り
 * @param props
 * @returns
 */
export function GenerationTaskRatingSelect(props: Props) {
  return (
    <Select
      onValueChange={(value: string) => {
        props.onChange(Number.parseInt(value))
      }}
    >
      <SelectTrigger className="h-9 w-44">
        <StarIcon className="w-4" />
        {`(${props.usedRatingCount}/${props.maxRatingCount})`}
        <SelectValue placeholder="すべて" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="-1">すべて</SelectItem>
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
