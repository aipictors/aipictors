import { UserTabs } from "~/routes/($lang)._main.users.$user._index/components/user-tabs"
import { type FragmentOf, graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { UserNovelsContents } from "~/routes/($lang)._main.users.$user.novels/components/user-novels-contents"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  novels: FragmentOf<typeof UserNovelsItemFragment>[]
  page: number
  maxCount: number
}

export function UserNovelsContentBody(props: Props) {
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const { data: novelsWorks } = useQuery(UserNovelsQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        userId: props.user.id,
        ratings: ["G", "R15"],
        workType: "NOVEL",
        isNowCreatedAt: true,
      },
    },
  })

  const novels = novelsWorks?.works ?? props.novels

  const navigate = useNavigate()

  return (
    <div className="flex flex-col space-y-4">
      <UserTabs activeTab={t("小説", "Novels")} user={props.user} />
      <div className="flex min-h-96 flex-col gap-y-4">
        <section className="relative space-y-4">
          <UserNovelsContents novels={novels} />
        </section>
      </div>
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <ResponsivePagination
          perPage={32}
          maxCount={props.maxCount}
          currentPage={props.page}
          onPageChange={(page: number) => {
            navigate(`/users/${props.user.login}/novels?page=${page}`)
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
