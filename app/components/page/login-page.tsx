import { Card } from "~/components/ui/card"
import { AppCanvas } from "~/routes/($lang).app._index/components/app-canvas"
import { LoginDialogContent } from "~/components/login-dialog-content"

/**
 * ログインページ
 */
export function LoginPage() {
  return (
    <div className="flex w-full flex-col items-center justify-center pt-4 md:pt-0 lg:h-full lg:flex-row lg:items-start">
      <div className="flex h-full w-full flex-1 flex-col items-center">
        <div className="w-full space-y-4 lg:w-80">
          <h1 className="w-full text-lg">{"ここから先はログインが必要です"}</h1>
          <LoginDialogContent />
        </div>
      </div>
      <div className="hidden h-full w-full flex-1 lg:block">
        <Card className="h-full w-full bg-zinc-200 p-4 dark:bg-zinc-500">
          <p className="text-sm">{"aipictors.com"}</p>
          <AppCanvas />
        </Card>
      </div>
    </div>
  )
}
