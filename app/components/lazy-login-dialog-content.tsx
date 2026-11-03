import { lazy, Suspense } from "react"

const Content = lazy(() =>
  import("~/components/login-dialog-content").then((module) => ({
    default: module.LoginDialogContent,
  })),
)

/**
 * ログインのダイアログの中身を、開いたときに読み込む（ログイン中の人や、読むだけの人には要らない）
 */
export function LazyLoginDialogContent (): React.ReactNode {
  return (
    <Suspense fallback={<div className="min-h-64" />}>
      <Content />
    </Suspense>
  )
}
