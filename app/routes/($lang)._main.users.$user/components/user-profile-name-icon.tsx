import { OmissionNumber } from "~/components/omission-number"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { toOmissionNumberText } from "~/utils/to-omission-number-text"
import { UserProfileAvatar } from "~/routes/($lang)._main.users.$user/components/user-profile-avatar"
import { type FragmentOf, graphql } from "gql.tada"
import { UserActionShare } from "~/routes/($lang)._main.users.$user/components/user-action-share"

type Props = {
  user: FragmentOf<typeof userProfileIconFragment>
}

export const UserProfileNameIcon = (props: Props) => {
  return (
    <header className="relative">
      <div
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        className={"absolute z-10 top-[128px] md:top-[228px]"}
      >
        <div className="relative mr-auto flex items-center gap-4 p-0 pb-4 md:p-8">
          <UserProfileAvatar
            alt={props.user.name}
            src={
              props.user.iconUrl ??
              "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/no-profile.jpg"
            }
            size={"auto"}
          />
          <div className="hidden md:block">
            <h1 className="text-nowrap font-bold text-2xl text-white">
              {props.user.name}
            </h1>
            <h2 className="font-bold text-sm text-white opacity-50">
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
          <div className="absolute right-0 bottom-0 md:hidden">
            <UserActionShare login={props.user.login} name={props.user.name} />
          </div>
        </div>
        <div className="block md:hidden">
          <h1 className="text-nowrap font-bold text-md">{props.user.name}</h1>
          <h2 className="font-bold text-sm opacity-50">@{props.user.login}</h2>
        </div>

        <div className="flex md:hidden">
          <div className="w-32">
            <div className="white mt-4 font-bold text-md">
              {toOmissionNumberText(props.user.followersCount)}
            </div>
            <div className="white mt-1 text-sm opacity-50">{"フォロワー"}</div>
          </div>
          <div className="w-32">
            <div className="white mt-4 font-bold text-md">
              {toOmissionNumberText(props.user.receivedLikesCount)}
            </div>
            <div className="white mt-1 text-sm opacity-50">{"いいね"}</div>
          </div>
        </div>
      </div>
    </header>
  )
}

export const userProfileIconFragment = graphql(
  `fragment UserProfileIcon on UserNode @_unmask {
    id
    login
    nanoid
    name
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
  [partialWorkFieldsFragment],
)
