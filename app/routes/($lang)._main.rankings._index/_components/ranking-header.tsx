import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

type Props = {
  year: number
  month: number
  day?: number
}

export const RankingHeader = (props: Props) => {
  return (
    <div className="flex">
      <div className="flex flex-col">
        <p className="text-2xl">{"ランキング"}</p>
        <div className="flex flex-col">
          <div className="flex">
            <ChevronLeftIcon />
            <p>{`${props.year}年${props.month}月`}</p>
            <ChevronRightIcon />
          </div>
        </div>
      </div>
    </div>
  )
}
