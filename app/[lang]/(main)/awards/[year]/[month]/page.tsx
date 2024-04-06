import { RankingHeader } from "@/[lang]/(main)/awards/_components/ranking-header"
import { AppPage } from "@/_components/app/app-page"
import type { Metadata } from "next"

type Props = {
  params: {
    year: string
    month: string
  }
}

/**
 * ある月のランキングの履歴
 * @param props
 * @returns
 */
const MonthAwardsPage = async (props: Props) => {
  const year = Number.parseInt(props.params.year)

  const month = Number.parseInt(props.params.month)

  return (
    <AppPage>
      <RankingHeader year={year} month={month} day={0} />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const generateStaticParams = () => {
  return []
}

export default MonthAwardsPage
