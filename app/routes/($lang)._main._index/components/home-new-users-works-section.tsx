import { AuthContext } from "~/contexts/auth-context"
import {
  HomeWorkFragment,
  HomeWorkSection,
} from "~/routes/($lang)._main._index/components/home-work-section"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { config } from "~/config"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  works: FragmentOf<typeof HomeNewUsersWorksFragment>[]
  onSelect?: (index: number) => void
}

/**
 * 新規ユーザの作品
 */
export function HomeNewUsersWorksSection(props: Props) {
  const appContext = useContext(AuthContext)

  // 新規ユーザ作品
  const { data: newUsersWorksResp } = useQuery(NewUsersWorksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: config.query.homeWorkCount.newUser,
      where: {
        ratings: ["G"],
        isNowCreatedAt: true,
      },
    },
  })

  const workDisplayed = newUsersWorksResp?.newUserWorks ?? props.works

  const t = useTranslation()

  return (
    <>
      {workDisplayed.length > 0 && (
        <HomeWorkSection
          title={t("新規クリエイターの初投稿作品", "New creators' first works")}
          works={workDisplayed}
          isCropped={true}
          isShowProfile={false}
        />
      )}
    </>
  )
}

export const HomeNewUsersWorksFragment = graphql(
  `fragment HomeNewUsersWorks on WorkNode @_unmask {
    id
    ...HomeWork
  }`,
  [HomeWorkFragment],
)

const NewUsersWorksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: NewUsersWorksWhereInput!) {
    newUserWorks(offset: $offset, limit: $limit, where: $where) {
      ...HomeNewUsersWorks
    }
  }`,
  [HomeNewUsersWorksFragment],
)
