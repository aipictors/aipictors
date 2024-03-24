import { AppPage } from "@/components/app/app-page"
import type { Metadata } from "next"

/**
 * 組織について
 * @returns
 */
const AboutUsPage = async () => {
  return (
    <AppPage>
      <div className="flex flex-col">
        <h2 className="py-2 font-bold text-2xl">運営会社について</h2>
        <p>
          Aipictors株式会社が運営しております。お問い合わせは
          hello@aipictors.com からお願い致します。
        </p>
      </div>
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AboutUsPage
