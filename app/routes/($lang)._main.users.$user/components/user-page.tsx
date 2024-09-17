import { type FragmentOf, graphql } from "gql.tada"
import { Lumiflex } from "uvcanvas"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"
import { UserHomeMain } from "~/routes/($lang)._main.users.$user/components/user-home-main"
import { UserContents } from "~/routes/($lang)._main.users.$user/components/user-contents"
import {
  UserProfileNameIcon,
  type UserProfileIconFragment,
} from "~/routes/($lang)._main.users.$user/components/user-profile-name-icon"
import type { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"
import type { HomeNovelsWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-novels-works-section"
import type { HomeVideosWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-video-works-section"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  isSensitive?: boolean
  works?: FragmentOf<typeof HomeWorkFragment>[]
  novelWorks?: FragmentOf<typeof HomeNovelsWorkListItemFragment>[]
  columnWorks?: FragmentOf<typeof HomeWorkFragment>[]
  videoWorks?: FragmentOf<typeof HomeVideosWorkListItemFragment>[]
  worksCount?: number
  novelWorksCount?: number
  columnWorksCount?: number
  videoWorksCount?: number
}

export function UserPage(props: Props) {
  return (
    <div className="flex w-full flex-col justify-center">
      <div className="relative">
        <div className="relative">
          {props.user.headerImageUrl ? (
            <div className="relative min-h-[168px] md:min-h-[320px]">
              {props.user.headerImageUrl ? (
                <>
                  <div
                    className="absolute top-0 left-0 z-10 z-standard flex h-full min-h-[168px] w-full items-center justify-center md:min-h-[320px]"
                    style={{
                      background: "center top / contain no-repeat",
                      backgroundImage: `url(${props.user.headerImageUrl})`,
                      maxHeight: "240px",
                    }}
                  />
                  <div className="absolute right-0 bottom-0 left-0 z-10 box-border flex h-24 flex-col justify-end bg-gradient-to-t from-black to-transparent p-4 pb-7 opacity-0 md:opacity-50" />
                </>
              ) : (
                <>
                  <div
                    className="absolute top-0 left-0 z-10 z-standard flex h-16 min-h-[168px] w-full items-center justify-center opacity-50 md:min-h-[320px]"
                    style={{
                      background: "center top / contain no-repeat",
                      maxHeight: "240px",
                    }}
                  >
                    <Lumiflex />
                  </div>
                  <div className="absolute right-0 bottom-0 left-0 z-10 box-border flex h-24 flex-col justify-end bg-gradient-to-t from-black to-transparent p-4 pb-7 opacity-0 md:opacity-50" />
                </>
              )}
              <div className="relative m-auto">
                <div className="absolute top-0 left-0 max-h-full min-h-[168px] w-full max-w-full overflow-hidden md:min-h-[320px]">
                  <img
                    className="block h-full max-h-full min-h-[168px] w-full max-w-full scale-125 object-cover object-center blur-[64px] transition-opacity duration-500 md:min-h-[320px]"
                    src={props.user.headerImageUrl}
                    alt=""
                  />
                </div>
                <div className="absolute bottom-0 left-8 z-30">
                  <UserProfileNameIcon user={props.user} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="relative min-h-[168px] overflow-hidden md:min-h-[320px]">
                <div className="relative m-auto">
                  <img
                    className="absolute top-0 left-0 h-full max-h-full min-h-[320px] w-full max-w-full object-cover object-center blur-[120px] transition-opacity duration-500 md:block md:blur-[120px]"
                    src={ExchangeIconUrl(props.user.iconUrl)}
                    alt=""
                  />
                </div>
                <div className="absolute right-0 bottom-0 left-0 z-10 box-border flex h-24 flex-col justify-end bg-gradient-to-t from-black to-transparent p-4 pb-7 opacity-0 md:opacity-50" />
              </div>
              <div className="absolute top-0 left-8 z-20">
                <UserProfileNameIcon user={props.user} />
              </div>
            </>
          )}
        </div>
        <UserHomeMain user={props.user} userId={props.user.id} />
      </div>
      <UserContents
        user={props.user}
        works={props.works}
        novelWorks={props.novelWorks}
        columnWorks={props.columnWorks}
        videoWorks={props.videoWorks}
        worksCount={props.worksCount}
        novelWorksCount={props.novelWorksCount}
        columnWorksCount={props.columnWorksCount}
        videoWorksCount={props.videoWorksCount}
      />
    </div>
  )
}

export const userHomeMainFragment = graphql(
  `fragment UserHomeMain on UserNode @_unmask {
    id
    login
    isFollowee
    isFollower
    isMuted
    name
    followersCount
    receivedLikesCount
    promptonUser {
      id
    }
  }`,
  [],
)

const userQuery = graphql(
  `query User(
    $userId: ID!,
  ) {
    user(id: $userId) {
      ...UserHomeMain
    }
  }`,
  [userHomeMainFragment],
)
