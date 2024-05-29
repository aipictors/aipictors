import { Button } from "@/_components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/_components/ui/select"
import type { WorkAccessType } from "@/_types/work-access-type"
import type { WorkRatingType } from "@/_types/work-rating-type"
import { useState } from "react"

type Props = {
  accessType: WorkAccessType | null
  rating: WorkRatingType | null
  setAccessType: (accessType: WorkAccessType | null) => void
  setRating: (rating: WorkRatingType | null) => void
}

/**
 * 作品一覧フィルター
 */
export const WorksListFilterSetting = (props: Props) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [maxHeight, setMaxHeight] = useState("0px")
  const [opacity, setOpacity] = useState(0)

  const onToggleFilterButton = () => {
    if (isFilterOpen) {
      setMaxHeight("0px")
      setOpacity(0)
    } else {
      setMaxHeight("500px") // 適切な高さに調整
      setOpacity(1)
    }
    setIsFilterOpen(!isFilterOpen)
  }

  return (
    <>
      <Button
        className="ml-auto block"
        variant={"secondary"}
        onClick={onToggleFilterButton}
      >
        絞り込む
      </Button>
      <div>
        <div
          className="mt-4"
          style={{
            maxHeight: maxHeight,
            overflow: "hidden",
            transition: "max-height 0.3s ease-out, opacity 0.3s ease-out",
            opacity: opacity,
          }}
        >
          <Select
            value={props.accessType ? props.accessType : ""}
            onValueChange={(value) => {
              // if (!value) {
              //   props.setAccessType(null)
              // }
              // props.setAccessType(value as WorkAccessType)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{"すべての公開範囲"}</SelectItem>
              <SelectItem value="PUBLIC">{"公開"}</SelectItem>
              <SelectItem value="SILENT">{"公開(新着無)"}</SelectItem>
              <SelectItem value="LIMITED">{"限定公開"}</SelectItem>
              <SelectItem value="PRIVATE">{"非公開"}</SelectItem>
              <SelectItem value="DRAFT">{"下書き"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )
}
