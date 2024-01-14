import { AppPage } from "@/components/app/app-page"
import type { Metadata } from "next"

/**
 * ダウンロードしたスタンプの一覧
 * @returns
 */
const StickersDownloadsPage = async () => {
  return (
    <AppPage>
      <div className="flex flex-col max-w-lg w-full p-4 space-y-8">
        <p className="font-bold text-2xl">{"DL済みスタンプ"}</p>
      </div>
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default StickersDownloadsPage
