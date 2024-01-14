import { AppPage } from "@/components/app/app-page"
import type { Metadata } from "next"

const PrivacyPage = async () => {
  return (
    <AppPage>
      <article>
        <h1>{"プライバシーポリシー"}</h1>
      </article>
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default PrivacyPage
