import { type FragmentOf, graphql } from "gql.tada"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { NovelWorkPreviewItem } from "~/routes/($lang)._main._index/components/novel-work-preview-item"
import { LikeButton } from "~/components/like-button"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"

type Props = {
  works: FragmentOf<typeof UserNovelsItemFragment>[]
  page: number
  maxCount: number
}

export function UserNovelList(props: Props) {
  const authContext = useContext(AuthContext)

  const userId = props.works[0]?.user.id ?? ""

  const userLogin = props.works[0]?.user.login ?? ""

  const { data: novelsWorks } = useQuery(UserNovelsQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn || userId === "",
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        userId: userId,
        ratings: ["G", "R15"],
        workType: "NOVEL",
        isNowCreatedAt: true,
      },
    },
  })

  const novels = novelsWorks?.works ?? props.works

  const navigate = useNavigate()

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex min-h-96 flex-col gap-y-4">
        <section className="relative space-y-4">
          <div className="flex flex-wrap gap-4">
            {novels.map((work) => (
              <div
                key={work.id}
                className="relative ml-4 inline-block h-full rounded border-2 border-gray border-solid"
              >
                <NovelWorkPreviewItem
                  workId={work.id}
                  imageUrl={work.smallThumbnailImageURL}
                  title={work.title}
                  text={work.description ?? ""}
                />
                <UserNameBadge
                  userId={work.user.id}
                  userIconImageURL={ExchangeIconUrl(work.user.iconUrl)}
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
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <ResponsivePagination
          perPage={32}
          maxCount={props.maxCount}
          currentPage={props.page}
          onPageChange={(page: number) => {
            navigate(`/users/${userLogin}/novels?page=${page}`)
          }}
        />
      </div>
    </div>
  )
}

export const UserNovelsItemFragment = graphql(
  `fragment UserNovelsItem on WorkNode @_unmask {
    id
    smallThumbnailImageURL
    title
    description
    isLiked
    user {
      id
      iconUrl
      name
      login
    }
  }`,
)

export const UserNovelsQuery = graphql(
  `query UserNovels($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...UserNovelsItem
    }
    worksCount(where: $where)
  }`,
  [UserNovelsItemFragment],
)
