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
  works: FragmentOf<typeof UserNotesItemFragment>[]
  page: number
  maxCount: number
  sort: UserWorksSort
  login: string
}

/**
 * ユーザーページの「コラム」タブ
 */
export function UserNoteList(props: Props) {
  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const userId = props.works[0]?.user?.id ?? ""

  // いいね済みかどうかは見ている人で変わるので、ログイン中だけ取り直す
  const { data } = useQuery(UserNotesQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn || userId === "",
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        userId,
        ratings: ["G", "R15"],
        workType: "COLUMN",
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
      title={t("コラム", "Columns")}
      count={props.maxCount}
      basePath={`/users/${encodeURIComponent(props.login)}/notes`}
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

export const UserNotesItemFragment = graphql(
  `fragment UserNotesItem on WorkNode @_unmask {
    id
    smallThumbnailImageURL
    isLiked
    title
    likesCount
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
