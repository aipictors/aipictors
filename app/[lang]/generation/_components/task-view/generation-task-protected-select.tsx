import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LockKeyholeIcon } from "lucide-react"

type Props = {
  onChange(value: number): void
}

/**
 * 保護
 * @param props
 * @returns
 */
export function GenerationTaskProtectedSelect(props: Props) {
  return (
    <Select
      onValueChange={(value: string) => {
        props.onChange(Number.parseInt(value))
      }}
    >
      <SelectTrigger className="h-9 w-24">
        <LockKeyholeIcon className="w-4" />
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
