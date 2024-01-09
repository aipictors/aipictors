import { RankingHeader } from "@/app/[lang]/(main)/awards/_components/ranking-header"
import { MainPage } from "@/app/_components/page/main-page"
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
  const year = parseInt(props.params.year)

  const month = parseInt(props.params.month)

  return (
    <MainPage>
      <RankingHeader year={year} month={month} day={0} />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const generateStaticParams = () => {
  return []
}

export const revalidate = 60

export default MonthAwardsPage
