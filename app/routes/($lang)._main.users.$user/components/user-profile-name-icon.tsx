import { OmissionNumber } from "~/components/omission-number"
import { UserProfileAvatar } from "~/routes/($lang)._main.users.$user/components/user-profile-avatar"
import { type FragmentOf, graphql } from "gql.tada"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
}

export function UserProfileNameIcon(props: Props) {
  return (
    <header className="relative">
      <div
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        className={"absolute z-10 top-[128px] md:top-[228px]"}
      >
        <div className="relative mr-auto flex items-center gap-4 p-0 pb-4 md:p-8">
          <UserProfileAvatar
            alt={props.user.name}
            src={ExchangeIconUrl(props.user.iconUrl)}
            size={"auto"}
          />
          <div className="hidden md:block">
            <h1 className="text-nowrap font-bold text-2xl text-white">
              {props.user.name}
            </h1>
            <h2 className="text-nowrap font-bold text-sm text-white opacity-50">
              @{props.user.login}
            </h2>
            <div className="flex">
              <div className="w-32">
                <div className="white mt-4 font-bold text-xl">
                  <OmissionNumber number={props.user.followersCount} />
                </div>
                <div className="white mt-4 text-md opacity-50">
                  {"フォロワー"}
                </div>
              </div>
              <div className="w-32">
                <div className="white mt-4 font-bold text-xl">
                  <OmissionNumber number={props.user.receivedLikesCount} />
                </div>
                <div className="white mt-4 text-md opacity-50">{"いいね"}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="block md:hidden">
          <h1 className="text-nowrap font-bold text-md">{props.user.name}</h1>
          <h2 className="font-bold text-sm opacity-50">@{props.user.login}</h2>
        </div>
      </div>
    </header>
  )
}

export const UserProfileIconFragment = graphql(
  `fragment UserProfileIcon on UserNode @_unmask {
    id
    login
    nanoid
    name
    biography
    receivedLikesCount
    createdAt
    receivedViewsCount
    awardsCount
    followCount
    followersCount
    worksCount
    iconUrl
    headerImageUrl
  }`,
)
