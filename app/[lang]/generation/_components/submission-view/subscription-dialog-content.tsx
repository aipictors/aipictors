import { PlusAbout } from "@/[lang]/(main)/plus/_components/plus-about"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { Link } from "@remix-run/react"
import { Suspense } from "react"

/**
 * サブスクリプション案内ダイアログ内容
 * @param props
 * @returns
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
