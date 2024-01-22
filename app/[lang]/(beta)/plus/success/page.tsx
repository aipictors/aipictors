import { AppPageCenter } from "@/components/app/app-page-center"
import { Button } from "@/components/ui/button"
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
      <div className="space-y-16 max-w-sm w-full mx-auto px-6 pt-16">
        <div className="space-y-4">
          <div className="w-full flex justify-center">
            <ThumbsUpIcon className="h-16 w-16" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold flex justify-center">
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

export const revalidate = 240

export default PlusSuccessPage
