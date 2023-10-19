import { MainRankingHeader } from "app/[lang]/(main)/awards/_components/MainRankingHeader"
import { MainPage } from "app/_components/MainPage"
import type { Metadata } from "next"

const AwardsPage = async () => {
  const year = new Date().getFullYear()

  const month = new Date().getMonth() + 1

  return (
    <MainPage>
      <MainRankingHeader year={year} month={month} day={1} />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AwardsPage
