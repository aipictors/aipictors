import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

/**
 * 一覧の読み込みに失敗したとき。「まだありません」と区別して、読み直せるようにする
 */
export function FeedLoadError(props: { onRetry: () => void }) {
  const t = useTranslation()
  return (
    <div className="space-y-3 py-10 text-center">
      <p className="text-muted-foreground text-sm">
        {t(
          "読み込めませんでした。少し待ってからもう一度お試しください。",
          "Could not load. Please wait a moment and try again.",
        )}
      </p>
      <Button variant="secondary" onClick={props.onRetry}>
        {t("読み直す", "Try again")}
      </Button>
    </div>
  )
}

/**
 * ページ送りで最後より先を開いたとき。「フォローしていない」の案内と区別して、先頭へ戻れるようにする
 */
export function FeedPageEnd(props: { onBackToFirstPage: () => void }) {
  const t = useTranslation()
  return (
    <div className="space-y-3 py-10 text-center">
      <p className="text-muted-foreground text-sm">
        {t(
          "このページに作品はありません。",
          "There are no works on this page.",
        )}
      </p>
      <Button variant="secondary" onClick={props.onBackToFirstPage}>
        {t("最初のページへ", "Back to first page")}
      </Button>
    </div>
  )
}
