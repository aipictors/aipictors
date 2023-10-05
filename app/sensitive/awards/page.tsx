import type { Metadata } from "next"
import { MainRankingHeader } from "app/(main)/awards/components/MainRankingHeader"
import { MainPage } from "app/components/MainPage"

const SensitiveAwardsPage = async () => {
  const year = new Date().getFullYear()

  const month = new Date().getMonth() + 1

  const day = new Date().getDate()

  return (
    <MainPage>
      <MainRankingHeader year={year} month={month} day={day} />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SensitiveAwardsPage
