import { RankingHeader } from "@/[lang]/(main)/awards/_components/ranking-header"
import { AppPage } from "@/_components/app/app-page"
import { ClientParamsError } from "@/errors/client-params-error"
import { useParams } from "@remix-run/react"

export default function SensitiveMonthAward() {
  const params = useParams<"year" | "month" | "day">()

  if (
    params.year === undefined ||
    params.month === undefined ||
    params.day === undefined
  ) {
    throw new ClientParamsError()
  }

  const year = Number.parseInt(params.year)

  const month = Number.parseInt(params.month)

  return (
    <AppPage>
      <RankingHeader year={year} month={month} day={1} />
    </AppPage>
  )
}
