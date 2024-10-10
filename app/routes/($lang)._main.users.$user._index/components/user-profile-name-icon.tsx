import { OmissionNumber } from "~/components/omission-number"
import { UserProfileAvatar } from "~/routes/($lang)._main.users.$user._index/components/user-profile-avatar"
import { type FragmentOf, graphql } from "gql.tada"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"
import { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"
import { UserSubscriptionIcon } from "~/routes/($lang)._main.users.$user._index/components/user-subscription-icon"
import { UserModeratorIcon } from "~/routes/($lang)._main.users.$user._index/components/user-moderator-icon"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
}

export function UserProfileNameIcon(props: Props) {
  const t = useTranslation()

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
            <div className="flex items-center space-x-2">
              <h1 className="text-nowrap font-bold text-2xl text-white">
                {props.user.name}
              </h1>
              <UserSubscriptionIcon passType={props.user.pass?.type} />
              <UserModeratorIcon isModerator={props.user.isModerator} />
            </div>
            <h2 className="text-nowrap font-bold text-sm text-white opacity-50">
              @{props.user.login}
            </h2>
            <div className="flex">
              <div className="w-32">
                <div className="white mt-4 font-bold text-xl">
                  <OmissionNumber number={props.user.followersCount} />
                </div>
                <div className="white mt-4 text-md opacity-50">
                  {t("フォロワー", "Followers")}
                </div>
              </div>
              <div className="w-32">
                <div className="white mt-4 font-bold text-xl">
                  <OmissionNumber number={props.user.receivedLikesCount} />
                </div>
                <div className="white mt-4 text-md opacity-50">
                  {t("いいね", "Likes")}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="block md:hidden">
          <div className="flex items-center space-x-2">
            <h1 className="text-nowrap font-bold text-md">{props.user.name}</h1>
            <UserSubscriptionIcon passType={props.user.pass?.type} />
            <UserModeratorIcon isModerator={props.user.isModerator} />
          </div>
          <h2 className="font-bold text-sm opacity-50">@{props.user.login}</h2>
        </div>
      </div>
    </header>
  )
}

export const UserProfileIconFragment = graphql(
  `fragment UserProfileIcon on UserNode @_unmask {
    name
    isModerator
    login
    receivedLikesCount
    followersCount
    iconUrl
    pass {
      type
    }
  }`,
  [HomeWorkFragment],
)
