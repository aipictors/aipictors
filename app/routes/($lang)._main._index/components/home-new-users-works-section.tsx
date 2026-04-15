import { AuthContext } from "~/contexts/auth-context"
import {
  HomeWorkFragment,
  HomeWorkSection,
} from "~/routes/($lang)._main._index/components/home-work-section"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext, useEffect } from "react"
import { config } from "~/config"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  works: FragmentOf<typeof HomeNewUsersWorksFragment>[]
  onSelect?: (index: string) => void
  onWorksLoaded?: (
    works: FragmentOf<typeof HomeNewUsersWorksFragment>[],
  ) => void
}

/**
 * 新規ユーザの作品
 */
export function HomeNewUsersWorksSection (props: Props) {
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

  useEffect(() => {
    props.onWorksLoaded?.(workDisplayed)
  }, [workDisplayed])

  const t = useTranslation()

  return (
    <>
      {workDisplayed.length > 0 && (
        <HomeWorkSection
          title={t("新規クリエイターの初投稿作品", "New creators' first works")}
          works={workDisplayed}
          isCropped={true}
          isShowProfile={false}
          autoPlayVideoPreview={true}
          onSelect={props.onSelect}
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
