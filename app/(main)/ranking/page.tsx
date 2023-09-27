import type { Metadata } from "next"
import { MainRankingHeader } from "app/(main)/ranking/components/MainRankingHeader"
import { MainRankingWorks } from "app/(main)/ranking/components/MainRankingWorks"
import { MainPage } from "app/components/MainPage"

const RankingPage = async () => {
  return (
    <MainPage>
      <MainRankingHeader />
      <MainRankingWorks />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default RankingPage
