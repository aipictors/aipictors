import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { TextWorkCard } from "~/components/user-works/text-work-card"
import {
  type UserWorksSort,
  UserWorksTabLayout,
} from "~/components/user-works/user-works-tab-layout"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  works: FragmentOf<typeof UserNovelsItemFragment>[]
  page: number
  maxCount: number
  sort: UserWorksSort
  login: string
}

/**
 * ユーザーページの「小説」タブ
 */
export function UserNovelList(props: Props) {
  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const userId = props.works[0]?.user?.id ?? ""

  // いいね済みかどうかは見ている人で変わるので、ログイン中だけ取り直す
  const { data } = useQuery(UserNovelsQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn || userId === "",
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        userId,
        ratings: ["G", "R15"],
        workType: "NOVEL",
        isNowCreatedAt: true,
        ...(props.sort === "popular"
          ? { orderBy: "LIKES_COUNT" as const, sort: "DESC" as const }
          : {}),
      },
    },
  })

  const works = data?.works ?? props.works

  return (
    <UserWorksTabLayout
      title={t("小説", "Novels")}
      count={props.maxCount}
      basePath={`/users/${encodeURIComponent(props.login)}/novels`}
      page={props.page}
      perPage={32}
      sort={props.sort}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {works.map((work) => (
          <TextWorkCard
            key={work.id}
            id={work.id}
            title={work.title}
            description={work.description ?? null}
            thumbnailUrl={work.smallThumbnailImageURL}
            likesCount={work.likesCount}
          />
        ))}
      </div>
    </UserWorksTabLayout>
  )
}

export const UserNovelsItemFragment = graphql(
  `fragment UserNovelsItem on WorkNode @_unmask {
    id
    smallThumbnailImageURL
    title
    likesCount
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
