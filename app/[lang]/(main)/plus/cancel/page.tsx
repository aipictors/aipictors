import { AppPageCenter } from "@/_components/app/app-page-center"
import { Button } from "@/_components/ui/button"
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
      <div className="mx-auto w-full max-w-sm space-y-16 px-6 pt-16">
        <div className="space-y-4">
          <div className="flex w-full justify-center">
            <FrownIcon className="h-16 w-16" />
          </div>
          <div className="space-y-2">
            <p className="flex justify-center font-bold text-xl">
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

export default PlusCancelPage
