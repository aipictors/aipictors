import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { toast } from "sonner"
import { LineLoggedInButton } from "~/components/button/line-logged-in-button"
import { writeLastLoginMethod } from "~/utils/login-flow"

type Props = {
  text?: string
  badge?: React.ReactNode
}

/**
 * LINEログインボタン
 */
export function LineLoggedInWithUrlButton(props: Props): React.ReactNode {
  const { data } = useQuery(authenticationLineAccountUrlQuery, {})

  const url = data?.authenticationLineAccountUrl

  const onClick = () => {
    if (url === null || url === "") {
      return
    }
    writeLastLoginMethod("line")
    window.location.href = url ?? ""
  }

  if (url === undefined || url === null || url === "") {
    return (
      <LineLoggedInButton
        text={props.text}
        badge={props.badge}
        onClick={() => {
          toast("LINEログインのURLが取得できませんでした。")
        }}
        disabled={true}
      />
    )
  }

  return (
    <LineLoggedInButton
      text={props.text}
      badge={props.badge}
      onClick={onClick}
    />
  )
}

const authenticationLineAccountUrlQuery = graphql(
  `query AuthenticationLineAccountUrl {
    authenticationLineAccountUrl
  }`,
)
