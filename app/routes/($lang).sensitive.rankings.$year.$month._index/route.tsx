import { ParamsError } from "~/errors/params-error"
import { RankingHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-header"
import { useParams } from "@remix-run/react"

export default function SensitiveMonthAward() {
  const params = useParams<"year" | "month" | "day">()

  if (
    params.year === undefined ||
    params.month === undefined ||
    params.day === undefined
  ) {
    throw new ParamsError()
  }

  const year = Number.parseInt(params.year)

  const month = Number.parseInt(params.month)

  return (
    <>
      <RankingHeader year={year} month={month} day={1} />
    </>
  )
}
