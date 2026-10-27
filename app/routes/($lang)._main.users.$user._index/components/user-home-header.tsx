import { type FragmentOf, graphql, readFragment } from "gql.tada"
import type React from "react"

type Props = {
  user: FragmentOf<typeof UserHomeHeaderFragment>
  userIconView: React.ReactNode
}

/**
 * ユーザーページの上部（ヘッダー画像＋プロフィール）
 * ヘッダー画像は本文と同じ幅で、高さを抑える（以前は PC で画面の 1/3 を使っていた）。
 * 画像は 1 枚だけ読み込む（以前は背景とぼかし用に同じ画像を 2 回描いていた）
 */
export function UserHomeHeader(props: Props) {
  const user = readFragment(UserHomeHeaderFragment, props.user)

  return (
    <div className="mx-auto w-full max-w-6xl px-0 md:px-8 md:pt-4">
      <div className="relative aspect-[3/1] max-h-64 w-full overflow-hidden bg-gradient-to-br from-sky-200 via-violet-200 to-pink-200 md:rounded-2xl dark:from-sky-950 dark:via-violet-950 dark:to-pink-950">
        {user.headerImageUrl && (
          <img
            src={user.headerImageUrl}
            alt=""
            className="absolute inset-0 size-full object-cover"
            width={1200}
            height={400}
            fetchPriority="high"
            decoding="async"
          />
        )}
      </div>
      <div className="relative z-10 px-4 pt-3 pb-2 md:px-6">
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
