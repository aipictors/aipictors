import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { graphql, readFragment, type FragmentOf } from "gql.tada"
import type React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"

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
        <div className="relative min-h-[168px] overflow-hidden md:min-h-[320px]">
          <div className="relative m-auto">
            <Avatar className="h-6 w-6">
              <AvatarImage
                className="absolute top-0 left-0 h-full max-h-full min-h-[320px] w-full max-w-full object-cover object-center blur-[120px] transition-opacity duration-500 md:block md:blur-[120px]"
                src={withIconUrlFallback(user.iconUrl)}
                alt=""
              />
              <AvatarFallback />
            </Avatar>
          </div>
          <div className="absolute right-0 bottom-0 left-0 z-10 box-border flex h-24 flex-col justify-end bg-linear-to-t from-black to-transparent p-4 pb-7 opacity-0 md:opacity-50" />
        </div>
        <div className="absolute top-0 left-8 z-20">{props.userIconView}</div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="relative min-h-[168px] md:min-h-[320px]">
        <div
          className="absolute top-0 left-0 z-10 z-standard flex h-full min-h-[168px] w-full items-center justify-center md:min-h-[320px]"
          style={{
            background: "center top / contain no-repeat",
            backgroundImage: `url(${user.headerImageUrl})`,
            maxHeight: "240px",
          }}
        />
        <div className="absolute right-0 bottom-0 left-0 z-10 box-border flex h-24 flex-col justify-end bg-linear-to-t from-black to-transparent p-4 pb-7 opacity-0 md:opacity-50" />
        <div className="relative m-auto">
          <div className="absolute top-0 left-0 max-h-full min-h-[168px] w-full max-w-full overflow-hidden md:min-h-[320px]">
            <img
              className="block h-full max-h-full min-h-[168px] w-full max-w-full scale-125 object-cover object-center blur-[64px] transition-opacity duration-500 md:min-h-[320px]"
              src={user.headerImageUrl}
              alt=""
            />
          </div>
          <div className="absolute bottom-0 left-8 z-30">
            {props.userIconView}
            {/* <UserProfileNameIcon user={props.user} /> */}
          </div>
        </div>
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
