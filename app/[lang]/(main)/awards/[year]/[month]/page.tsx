import { MainRankingHeader } from "app/[lang]/(main)/awards/_components/MainRankingHeader"
import { MainPage } from "app/_components/MainPage"
import type { Metadata } from "next"

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
      <MainRankingHeader year={year} month={month} day={0} />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AwardsPage
