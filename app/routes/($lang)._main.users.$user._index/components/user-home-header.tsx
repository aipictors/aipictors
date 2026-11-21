import { type FragmentOf, graphql, readFragment } from "gql.tada"
import type React from "react"
import { toResizedImageUrl } from "~/utils/resized-image-url"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  user: FragmentOf<typeof UserHomeHeaderFragment>
  userIconView: React.ReactNode
  /** R18 のページで R18 用のヘッダー画像を出すとき（null・未指定はいつものヘッダー） */
  headerImageUrl?: string | null
}

/**
 * ユーザーページの上部（ヘッダー画像＋プロフィール）
 * ヘッダー画像は本文と同じ幅で、スマホは 5:2・PC は 3:1（設定画面のプレビューと切り抜きも同じ比率。高さの上限で上下が切れないようにする）。
 * 画像は 1 枚だけ読み込む（以前は背景とぼかし用に同じ画像を 2 回描いていた）
 */
export function UserHomeHeader(props: Props) {
  const user = readFragment(UserHomeHeaderFragment, props.user)
  const headerImageUrl = props.headerImageUrl || user.headerImageUrl

  return (
    <div className="mx-auto w-full max-w-6xl px-0 md:px-8 md:pt-4">
      <div className="relative aspect-[5/2] w-full overflow-hidden bg-muted md:aspect-[3/1] md:rounded-3xl">
        {headerImageUrl ? (
          <img
            src={headerImageUrl}
            alt=""
            className="absolute inset-0 size-full object-cover"
            width={1200}
            height={400}
            fetchPriority="high"
            decoding="async"
          />
        ) : (
          // ヘッダー画像がない人は、アイコンの色を広げて背景にする
          <img
            src={toResizedImageUrl(withIconUrlFallback(user.iconUrl), 96)}
            alt=""
            className="absolute inset-0 size-full scale-125 object-cover opacity-80 blur-3xl saturate-150"
            decoding="async"
          />
        )}
      </div>
      <div className="relative z-10 px-4 pt-3 pb-4 md:px-6">
        {props.userIconView}
      </div>
    </div>
  )
}

export const UserHomeHeaderFragment = graphql(
  `fragment UserHomeHeaderFragment on UserNode {
    id
    headerImageUrl
    iconUrl
  }`,
)
