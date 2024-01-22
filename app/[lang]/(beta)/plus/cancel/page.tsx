import { AppPageCenter } from "@/components/app/app-page-center"
import { Button } from "@/components/ui/button"
import { FrownIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

/**
 * サブスクの決済をキャンセルした場合のページ
 * @returns
 */
const PlusCancelPage = async () => {
  return (
    <AppPageCenter>
      <div className="space-y-16 max-w-sm w-full mx-auto px-6 pt-16">
        <div className="space-y-4">
          <div className="w-full flex justify-center">
            <FrownIcon className="h-16 w-16" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold flex justify-center">
              {"決済に失敗しました"}
            </p>
            <p>
              {
                "決済処理がキャンセルされました。再度決済を行う場合は、Plusに戻ってください。"
              }
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <Link href="/plus" replace>
            <Button>{"Plusに戻る"}</Button>
          </Link>
        </div>
      </div>
    </AppPageCenter>
  )
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    robots: { index: false },
    title: { absolute: "Aipictors+のキャンセル" },
  }
}

export const revalidate = 240

export default PlusCancelPage
