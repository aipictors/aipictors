import { OmissionNumber } from "@/_components/omission-number"
import type { userQuery } from "@/_graphql/queries/user/user"
import { toOmissionNumberText } from "@/_utils/to-omission-number-text"
import { config } from "@/config"
import { UserProfileAvatar } from "@/routes/($lang)._main.users.$user/_components/user-profile-avatar"
import type { ResultOf } from "gql.tada"
import { useMediaQuery } from "usehooks-ts"

type UserProfileProps = {
  user: NonNullable<ResultOf<typeof userQuery>["user"]>
}

export const UserProfileNameIcon = (props: UserProfileProps) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <header className="relative">
      <div
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        className={"absolute z-10 top-[160px] md:top-[228px]"}
      >
        <div className="mr-auto flex items-center gap-4 p-4 md:p-8">
          <UserProfileAvatar
            alt={props.user.name}
            src={
              props.user.iconUrl ??
              "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/no-profile.jpg"
            }
            size={"auto"}
          />
          <div className="hidden md:block">
            <h1 className="font-bold text-2xl text-white">{props.user.name}</h1>
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
        </div>

        <div className="block md:hidden">
          <h1 className="font-bold text-2xl">{props.user.name}</h1>
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
