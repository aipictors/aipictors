"use client"
import { AppPage } from "@/components/app/app-page"
import { useLocalText } from "@/lib/app/hooks/use-local-text"
import { FrownIcon } from "lucide-react"

/**
 * データが存在しない場合のページ
 * @returns
 */
export const AppPageNotFound = () => {
  const t = useLocalText()

  return (
    <AppPage>
      <div className="flex justify-center h-[80vh] items-center">
        <div className="max-w-lg w-full space-y-8">
          <div className="flex justify-center">
            <FrownIcon className="w-16" />
          </div>
          <p className="text-center">
            {t("ページが見つかりません", "Page Not Found")}
          </p>
        </div>
      </div>
    </AppPage>
  )
}
