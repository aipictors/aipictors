import type { Metadata } from "next"
import { MainRankingHeader } from "app/(main)/awards/components/MainRankingHeader"
import { MainPage } from "app/components/MainPage"

type Props = {
  params: {
    year: string
    month: string
  }
}

const AwardsPage = async (props: Props) => {
  const year = parseInt(props.params.year)

  const month = parseInt(props.params.month)

  return (
    <MainPage>
      <MainRankingHeader year={year} month={month} day={null} />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AwardsPage
