import { RankingHeader } from "@/app/[lang]/(main)/awards/_components/ranking-header"
import { MainPage } from "@/app/_components/page/main-page"
import type { Metadata } from "next"

const SensitiveAwardsPage = async () => {
  const year = new Date().getFullYear()

  const month = new Date().getMonth() + 1

  const day = new Date().getDate()

  return (
    <MainPage>
      <RankingHeader year={year} month={month} day={day} />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SensitiveAwardsPage
