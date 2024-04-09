import { RankingHeader } from "@/[lang]/(main)/awards/_components/ranking-header"
import { AppPage } from "@/_components/app/app-page"

export default function SensitiveAwards() {
  const year = new Date().getFullYear()

  const month = new Date().getMonth() + 1

  const day = new Date().getDate()

  return (
    <AppPage>
      <RankingHeader year={year} month={month} day={day} />
    </AppPage>
  )
}
