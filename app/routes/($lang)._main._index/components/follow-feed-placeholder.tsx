import { useContext, useEffect, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { Link } from "~/lib/app/locale-router"
import { FollowFeedNotice } from "~/routes/($lang)._main._index/components/follow-feed-notice"
import {
  type FollowFeedSnapshot,
  readFollowFeedSnapshot,
} from "~/routes/($lang)._main._index/utils/follow-feed-snapshot"
import { readHeaderUserSnapshot } from "~/utils/header-user-snapshot"
import { toResizedImageUrl } from "~/utils/resized-image-url"

/**
 * フォロー新着が届くまでの表示。前回見た作品があれば先に出す
 * （最新の一覧が届いたら置き換わる）
 */
export function FollowFeedPlaceholder() {
  const authContext = useContext(AuthContext)
  const [snapshot, setSnapshot] = useState<FollowFeedSnapshot | null>(null)

  useEffect(() => {
    // ログアウトしたあとは、前の人の一覧を出さない
    if (readHeaderUserSnapshot() === null) return
    setSnapshot(readFollowFeedSnapshot())
  }, [])

  if (
    snapshot === null ||
    snapshot.items.length === 0 ||
    authContext.isNotLoggedIn ||
    (authContext.userId && authContext.userId !== snapshot.userId)
  ) {
    return <FollowFeedNotice />
  }

  if (snapshot.isTimelineView) {
    return (
      <div className="m-auto w-full max-w-xl space-y-4" aria-busy="true">
        {snapshot.items.slice(0, 6).map((item) => (
          <Link key={item.id} to={`/posts/${item.id}`} className="block">
            <img
              src={toResizedImageUrl(item.thumbnailUrl, 640)}
              alt={item.title}
              decoding="async"
              className="w-full rounded-lg bg-muted object-cover"
            />
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      aria-busy="true"
    >
      {snapshot.items.map((item) => (
        <Link key={item.id} to={`/posts/${item.id}`} className="block">
          <img
            src={toResizedImageUrl(item.thumbnailUrl, 480)}
            alt={item.title}
            decoding="async"
            className="aspect-square w-full rounded-md bg-muted object-cover"
          />
        </Link>
      ))}
    </div>
  )
}
