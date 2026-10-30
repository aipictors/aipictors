import { Loader2Icon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  /** 説明の下に出す小さな文（未ログインの案内など）。省略時は読み込み中の表示 */
  children?: React.ReactNode
}

/**
 * フォロー新着タブの、作品が出るまでの表示（読み込み中・ログイン確認中・未ログイン）。
 * ログイン状態はブラウザで Firebase に確認するまで分からないので、サーバーの HTML では
 * 説明文だけを先に出しておき、状態が分かったら下の小さな文だけを差し替える。
 * 枠の高さを変えないのでレイアウトがずれず、後から出る文が説明文より小さいので
 * 一番大きく見える要素（LCP）も最初の描画で決まる。
 */
export function FollowFeedNotice(props: Props): React.ReactNode {
  const t = useTranslation()

  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-base">
        {t(
          "フォローしたユーザーの新しい作品が、ここに新着順で表示されます",
          "New works from users you follow appear here, newest first",
        )}
      </p>
      <div className="flex h-6 items-center text-muted-foreground text-sm">
        {props.children ?? (
          <Loader2Icon
            className="size-5 animate-spin text-border"
            aria-label={t("読み込み中", "Loading")}
          />
        )}
      </div>
    </div>
  )
}
