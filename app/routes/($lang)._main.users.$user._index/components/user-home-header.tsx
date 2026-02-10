import { type FragmentOf, graphql, readFragment } from "gql.tada"
import type React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  user: FragmentOf<typeof UserHomeHeaderFragment>
  userIconView: React.ReactNode
}

/**
 * マイページのヘッダー
 */
export function UserHomeHeader(props: Props) {
  const user = readFragment(UserHomeHeaderFragment, props.user)

  // ヘッダー画像がない場合
  if (user.headerImageUrl === null) {
    return (
      <div className="relative">
        <div className="relative h-20 overflow-hidden md:h-40">
          <div className="relative m-auto">
            <Avatar className="size-6">
              <AvatarImage
                className="pointer-events-none absolute top-0 left-0 h-full w-full max-w-full object-cover object-center blur-[120px] transition-opacity duration-500 md:block md:blur-[120px]"
                src={withIconUrlFallback(user.iconUrl)}
                alt=""
              />
              <AvatarFallback />
            </Avatar>
          </div>
        </div>
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-2 pb-3 md:px-8 md:pt-4 md:pb-6">
          {props.userIconView}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="relative h-[140px] md:min-h-[320px]">
        <div
          className="pointer-events-none absolute top-0 left-0 z-10 z-standard flex h-full w-full items-center justify-center"
          style={{
            background: "center / cover no-repeat",
            backgroundImage: `url(${user.headerImageUrl})`,
          }}
        />
        <div className="relative m-auto">
          <div className="pointer-events-none absolute top-0 left-0 h-full w-full max-w-full overflow-hidden">
            <img
              className="block h-full w-full max-w-full scale-125 object-cover object-center blur-[64px] transition-opacity duration-500"
              src={user.headerImageUrl}
              alt=""
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-3 pb-4 md:px-8 md:pt-6 md:pb-8">
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
