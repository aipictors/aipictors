import type { Metadata } from "next"

import { MainRankingHeader } from "app/(main)/awards/components/MainRankingHeader"
import { MainPage } from "app/components/MainPage"

const AwardsPage = async () => {
  return (
    <MainPage>
      <MainRankingHeader />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AwardsPage
