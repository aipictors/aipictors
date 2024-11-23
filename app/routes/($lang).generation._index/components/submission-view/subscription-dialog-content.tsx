import { AppLoadingPage } from "~/components/app/app-loading-page"
import { ScrollArea } from "~/components/ui/scroll-area"
import { PlusAbout } from "~/routes/($lang)._main.plus._index/components/plus-about"
import { Link } from "react-router";
import { Suspense } from "react"

/**
 * サブスクリプション案内ダイアログ内容
 */
export function SubscriptionDialogContent() {
  return (
    <div>
      <Link className="pt-2 text-center font-bold" to="/plus">
        プラン変更、詳細はこちら
      </Link>
      <ScrollArea className="h-full max-h-[64vh] min-w-64 p-4">
        <Suspense fallback={<AppLoadingPage />}>
          <PlusAbout hideSubmitButton={true} showUpgradePlansOnly={true} />
        </Suspense>
      </ScrollArea>
    </div>
  )
}
