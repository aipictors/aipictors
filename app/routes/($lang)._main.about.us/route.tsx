import { AppPage } from "@/_components/app/app-page"
import type { MetaFunction } from "@remix-run/cloudflare"

export const meta: MetaFunction = () => {
  return [{ title: "運営会社について" }]
}

/**
 * 組織について
 * @returns
 */
export default function AboutUs() {
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
