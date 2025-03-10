import { type FragmentOf, graphql } from "gql.tada"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { useContext } from "react"
import { CarouselWithGradation } from "~/components/carousel-with-gradation"
import { LikeButton } from "~/components/like-button"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import { NovelWorkPreviewItem } from "~/routes/($lang)._main._index/components/video-work-preview-item"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useNavigate } from "react-router-dom"
import { ResponsivePagination } from "~/components/responsive-pagination"

type Props = {
  works: FragmentOf<typeof UserNotesItemFragment>[]
  page: number
  maxCount: number
}

export function UserSensitiveNoteList(props: Props) {
  const authContext = useContext(AuthContext)

  const userId =
    props.works.length > 0 && props.works[0]?.user
      ? (props.works[0].user.id ?? "")
      : ""

  const userLogin =
    props.works.length > 0 && props.works[0]?.user
      ? (props.works[0].user.login ?? "")
      : ""

  const { data: novelWorks } = useQuery(UserNotesQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn || userId === "",
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        userId: userId,
        ratings: ["G", "R15"],
        workType: "COLUMN",
        isNowCreatedAt: true,
      },
    },
  })

  const works = novelWorks?.works ?? props.works

  const navigate = useNavigate()

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex min-h-96 flex-col gap-y-4">
        <section className="relative space-y-4">
          <CarouselWithGradation
            items={works.map((work, index) => (
              // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
              <div className="h-full rounded border-2 border-gray border-solid">
                <div className="relative">
                  <NovelWorkPreviewItem
                    workId={work.id}
                    imageUrl={work.smallThumbnailImageURL}
                    title={work.title}
                    text={work.description ?? ""}
                    tags={[]}
                  />
                </div>
                {work.user && (
                  <>
                    <UserNameBadge
                      userId={work.user.id}
                      userIconImageURL={withIconUrlFallback(work.user.iconUrl)}
                      name={work.user.name}
                      width={"lg"}
                      padding={"md"}
                    />
                    <div className="absolute right-0 bottom-0">
                      <LikeButton
                        size={56}
                        targetWorkId={work.id}
                        targetWorkOwnerUserId={work.user.id}
                        defaultLiked={work.isLiked}
                        defaultLikedCount={0}
                        isBackgroundNone={true}
                        strokeWidth={2}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          />
        </section>
      </div>
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <ResponsivePagination
          perPage={32}
          maxCount={props.maxCount}
          currentPage={props.page}
          onPageChange={(page: number) => {
            navigate(`/users/${userLogin}/works?page=${page}`)
          }}
        />
      </div>
    </div>
  )
}

export const UserNotesItemFragment = graphql(
  `fragment UserNotesItem on WorkNode @_unmask {
    id
    smallThumbnailImageURL
    isLiked
    title
    description
    user {
      id
      name
      iconUrl
      login
    }
  }`,
)

export const UserNotesQuery = graphql(
  `query UserNotes($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...UserNotesItem
    }
    worksCount(where: $where)
  }`,
  [UserNotesItemFragment],
)
