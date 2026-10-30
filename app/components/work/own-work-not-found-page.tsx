import { useQuery } from "@apollo/client/index"
import { useNavigate } from "@remix-run/react"
import { graphql } from "gql.tada"
import { useContext, useEffect } from "react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AppNotFoundPage } from "~/components/app/app-not-found-page"
import { AuthContext } from "~/contexts/auth-context"

type Props = {
  workId: string | undefined
}

/**
 * 作品ページの 404
 * 予約投稿・非公開・下書きの作品はサーバーでは見えない（ログインなしで取得している）ので、
 * 持ち主がログイン中なら下書き表示（/posts/:id/draft）に移す
 */
export function OwnWorkNotFoundPage (props: Props) {
  const authContext = useContext(AuthContext)

  const navigate = useNavigate()

  const isSkip =
    props.workId === undefined ||
    authContext.isLoading ||
    authContext.isNotLoggedIn

  const { data, loading } = useQuery(ownWorkQuery, {
    skip: isSkip,
    fetchPolicy: "network-only",
    variables: { id: props.workId ?? "" },
  })

  const work = data?.work ?? null

  const isOwnWork =
    work !== null &&
    authContext.userId !== null &&
    work.user?.id === authContext.userId

  useEffect(() => {
    if (!isOwnWork || work === null) return
    navigate(`/posts/${work.id}/draft`, { replace: true })
  }, [isOwnWork, work?.id])

  if (authContext.isLoading || loading || isOwnWork) {
    return <AppLoadingPage />
  }

  return <AppNotFoundPage />
}

const ownWorkQuery = graphql(
  `query OwnWorkForNotFound($id: ID!) {
    work(id: $id) {
      id
      user {
        id
      }
    }
  }`,
)
