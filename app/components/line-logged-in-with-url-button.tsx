import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { LineLoggedInButton } from "~/components/button/line-logged-in-button"

type Props = {
  text?: string
}

/**
 * LINEログインボタン
 */
export function LineLoggedInWithUrlButton(props: Props) {
  const { data } = useSuspenseQuery(authenticationLineAccountUrlQuery, {})

  const url = data.authenticationLineAccountUrl

  const onClick = () => {
    if (url === null || url === "") {
      return
    }
    window.location.href = url
  }

  if (url === null || url === "") {
    return (
      <LineLoggedInButton
        text={props.text}
        onClick={() => {}}
        disabled={true}
      />
    )
  }

  return <LineLoggedInButton text={props.text} onClick={onClick} />
}

const authenticationLineAccountUrlQuery = graphql(
  `query AuthenticationLineAccountUrl {
    authenticationLineAccountUrl
  }`,
)
