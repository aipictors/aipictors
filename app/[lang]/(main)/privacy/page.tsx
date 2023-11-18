import { MainPage } from "@/app/_components/page/main-page"
import type { Metadata } from "next"

const PrivacyPage = async () => {
  return (
    <MainPage>
      <article>
        <h1>{"プライバシーポリシー"}</h1>
      </article>
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default PrivacyPage
