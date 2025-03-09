import { useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"
import { Heart } from "lucide-react"
import { useContext } from "react"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import { Button } from "~/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "~/components/ui/carousel"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  works: FragmentOf<typeof EventAwardWorkListItemFragment>[]
  slug: string
}

/**
 * イベントランキング作品一覧
 */
export function EventAwardSensitiveWorkList(props: Props) {
  const authContext = useContext(AuthContext)

  const { data: resp } = useQuery(appAwardEventQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      slug: props.slug,
      isSensitive: true,
    },
  })

  const workDisplayed = resp?.appEvent?.awardWorks ?? props.works

  const t = useTranslation()

  return (
    <section className="relative space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="items-center space-x-2 font-bold text-md">
          {"ランキング"}
        </h2>
        {/* 昨日の日付 // /2024/05/01 */}
        <Link to={`/events/${props.slug}/award`}>
          <Button variant={"secondary"} size={"sm"}>
            {t("すべて見る", "All")}
          </Button>
        </Link>
      </div>
      <Carousel opts={{ dragFree: true, loop: false }}>
        <CarouselContent>
          {workDisplayed.map((work, index) => (
            <CarouselItem
              key={`carousel-${index.toString()}`}
              className="relative basis-1/3.5 space-y-2"
            >
              <div key={index.toString()} className="flex flex-col space-y-2">
                <div className="relative">
                  <CroppedWorkSquare
                    workId={work.id}
                    imageUrl={work.smallThumbnailImageURL}
                    subWorksCount={work.subWorksCount}
                    thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                    size="lg"
                    imageWidth={work.smallThumbnailImageWidth}
                    imageHeight={work.smallThumbnailImageHeight}
                    ranking={index + 1}
                  />
                  <div className="absolute right-0 bottom-0">
                    <LikeButton
                      size={56}
                      targetWorkId={work.id}
                      targetWorkOwnerUserId={work.user?.id ?? ""}
                      defaultLiked={work.isLiked}
                      defaultLikedCount={0}
                      isBackgroundNone={true}
                      strokeWidth={2}
                      isParticle={true}
                    />
                  </div>
                </div>
                <p className="max-w-40 overflow-hidden text-ellipsis text-nowrap font-bold text-md">
                  {work.title}
                </p>
                <div className="flex max-w-40 items-center justify-between">
                  <UserNameBadge
                    userId={work.user?.id ?? ""}
                    userIconImageURL={withIconUrlFallback(work.user?.iconUrl)}
                    name={work.user?.name ?? ""}
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
            </CarouselItem>
          ))}
          <CarouselItem className="relative w-16 basis-1/3.5 space-y-2" />
          {/* <div className="relative basis-1/3.5 space-y-2" /> */}
        </CarouselContent>
        {/* <div className="absolute top-0 left-0 h-full w-16 bg-linear-to-r from-card to-transparent" /> */}
        <CarouselPrevious className="absolute left-0" />
        {/* <div className="absolute top-0 right-0 h-full w-16 bg-linear-to-r from-transparent to-card" /> */}
        <CarouselNext className="absolute right-0" />
      </Carousel>
    </section>
  )
}

export const EventAwardWorkListItemFragment = graphql(
  `fragment EventAwardWorkListItem on WorkNode @_unmask {
    id
    title
    accessType
    adminAccessType
    type
    likesCount
    commentsCount
    bookmarksCount
    viewsCount
    createdAt
    rating
    isTagEditable
    smallThumbnailImageURL
    smallThumbnailImageHeight
    smallThumbnailImageWidth
    largeThumbnailImageURL
    largeThumbnailImageHeight
    largeThumbnailImageWidth
    type
    prompt
    negativePrompt
    isLiked
    thumbnailImagePosition
    description
    url
    subWorksCount
    tags {
      name
    }
    user {
      id
      name
      iconUrl
    }
    uuid
  }`,
)

const appAwardEventQuery = graphql(
  `query AppEvent($slug: String!, $isSensitive: Boolean!) {
    appEvent(slug: $slug) {
      awardWorks(offset: 0, limit: 20, isSensitive: $isSensitive) {
        ...EventAwardWorkListItem
      }
    }
  }`,
  [EventAwardWorkListItemFragment],
)
