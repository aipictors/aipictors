import { useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"
import { Heart } from "lucide-react"
import { useContext } from "react"
import { CarouselWithGradation } from "~/components/carousel-with-gradation"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { IconUrl } from "~/components/icon-url"
import { LikeButton } from "~/components/like-button"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
  isSensitive: boolean
  slug: string
}

/**
 * イベントランキング作品一覧
 */
export function EventAwardWorkList(props: Props) {
  const authContext = useContext(AuthContext)

  const { data: resp } = useQuery(appAwardEventQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      slug: props.slug,
      isSensitive: props.isSensitive,
    },
  })

  const workDisplayed = resp?.appEvent?.awardWorks ?? props.works

  return (
    <section className="relative space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="items-center space-x-2 font-bold text-md">
          {"ランキング"}
        </h2>
        {/* 昨日の日付 // /2024/05/01 */}
        <Link to={`/events/${props.slug}/award`}>
          <Button variant={"secondary"} size={"sm"}>
            {"すべて見る"}
          </Button>
        </Link>
      </div>
      <CarouselWithGradation
        items={workDisplayed
          .map((work) => ({
            id: work.id,
            src: work.smallThumbnailImageURL,
            width: work.smallThumbnailImageWidth,
            height: work.smallThumbnailImageHeight,
            workId: work.id,
            thumbnailImagePosition: work.thumbnailImagePosition,
            userId: work.user.id,
            userIcon: work.user.iconUrl,
            userName: work.user.name,
            title: work.title,
            isLiked: work.isLiked,
            subWorksCount: work.subWorksCount,
            likesCount: work.likesCount,
          }))
          .map((work, index) => (
            <div key={index.toString()} className="flex flex-col space-y-2">
              <div className="relative">
                <CroppedWorkSquare
                  workId={work.id}
                  imageUrl={work.src}
                  subWorksCount={work.subWorksCount}
                  thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                  size="lg"
                  imageWidth={work.width}
                  imageHeight={work.height}
                  ranking={index + 1}
                />
                <div className="absolute right-0 bottom-0">
                  <LikeButton
                    size={56}
                    targetWorkId={work.id}
                    targetWorkOwnerUserId={work.userId}
                    defaultLiked={work.isLiked}
                    defaultLikedCount={0}
                    isBackgroundNone={true}
                    strokeWidth={2}
                    isParticle={true}
                  />
                </div>
              </div>
              <p className="max-w-40 overflow-hidden text-ellipsis text-nowrap font-bold text-xs">
                {work.title}
              </p>
              <div className="flex max-w-40 items-center justify-between">
                <UserNameBadge
                  userId={work.userId}
                  userIconImageURL={IconUrl(work.userIcon)}
                  name={work.userName}
                  width={"lg"}
                />
                <div className="flex items-center space-x-1">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-3 w-3 fill-gray-400 text-gray-400" />
                    <span className="text-xs">{work.likesCount}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      />
    </section>
  )
}

const appAwardEventQuery = graphql(
  `query AppEvent($slug: String!, $isSensitive: Boolean!) {
    appEvent(slug: $slug) {
      awardWorks(offset: 0, limit: 20, isSensitive: $isSensitive) {
        ...PartialWorkFields
      }
    }
  }`,
  [partialWorkFieldsFragment],
)