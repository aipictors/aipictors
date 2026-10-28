import { useState } from "react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

interface Props {
  onRetry: () => Promise<unknown> | unknown
}

/**
 * 一覧の読み込みに失敗したとき（サーバーの混雑・障害）に、空のまま止まらないように出す
 */
export function WorksLoadError (props: Props) {
  const t = useTranslation()
  const [retrying, setRetrying] = useState(false)

  const retry = async () => {
    setRetrying(true)
    try {
      await props.onRetry()
    } catch {
      // 失敗したらこの表示のまま
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground text-sm">
      <p>
        {t(
          "作品を読み込めませんでした。時間をおいてもう一度お試しください。",
          "Could not load works. Please try again in a moment.",
        )}
      </p>
      <Button variant="secondary" disabled={retrying} onClick={retry}>
        {retrying ? t("読み込み中…", "Loading…") : t("再読み込み", "Retry")}
      </Button>
    </div>
  )
}
