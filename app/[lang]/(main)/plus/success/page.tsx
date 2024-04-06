import { AppPageCenter } from "@/_components/app/app-page-center"
import { Button } from "@/_components/ui/button"
import { ThumbsUpIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

/**
 * サブスクの決済を完了した場合のページ
 * @returns
 */
const PlusSuccessPage = async () => {
  return (
    <AppPageCenter>
      <div className="mx-auto w-full max-w-sm space-y-16 px-6 pt-16">
        <div className="space-y-4">
          <div className="flex w-full justify-center">
            <ThumbsUpIcon className="h-16 w-16" />
          </div>
          <div className="space-y-2">
            <p className="flex justify-center font-bold text-xl">
              {"決済に成功しました"}
            </p>
            <p>
              {
                "この度はAipictors+にご登録ありがとうございます。これからもよろしくお願いします。"
              }
            </p>
          </div>
          <div className="flex justify-center">
            <Link href="/plus" replace>
              <Button>{"Plusに戻る"}</Button>
            </Link>
          </div>
        </div>
      </div>
    </AppPageCenter>
  )
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    robots: { index: false },
    title: { absolute: "Aipictors+の手続き完了" },
  }
}

export default PlusSuccessPage
