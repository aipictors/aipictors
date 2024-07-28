import { AppPageCenter } from "@/components/app/app-page-center"
import { Button } from "@/components/ui/button"
import { Link } from "@remix-run/react"
import { FrownIcon } from "lucide-react"

/**
 * サブスクの決済をキャンセルした場合のページ
 */
export default function PlusCancel() {
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
          <Link to="/plus" replace>
            <Button>{"Plusに戻る"}</Button>
          </Link>
        </div>
      </div>
    </AppPageCenter>
  )
}
