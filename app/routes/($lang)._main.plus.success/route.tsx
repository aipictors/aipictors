import { Button } from "~/components/ui/button"
import { Link } from "react-router"
import { ThumbsUpIcon } from "lucide-react"

/**
 * サブスクの決済を完了した場合のページ
 */
export default function PlusSuccess() {
  return (
    <>
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
            <Link to="/plus" replace>
              <Button>{"Plusに戻る"}</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
