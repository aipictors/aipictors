import { AppFooter } from "@/[lang]/app/_components/app-footer"
import type { Metadata } from "next"

const AppSupportPage = async () => {
  return (
    <>
      <div className="flex min-h-screen justify-center py-8">
        <div>
          <p className="text-center">{"お問い合わせはこちらまで"}</p>
          <p className="text-center font-bold">hello@aipictors.com</p>
        </div>
      </div>
      <AppFooter />
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: { absolute: "サポート" },
  description: "Aipictorsのアプリをダウンロード",
}

export default AppSupportPage
