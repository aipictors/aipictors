import { getCookieLoginToken } from "~/utils/get-cookie-login-token"
import { useMutation } from "@apollo/client/index"
import { getAuth, signInWithCustomToken } from "firebase/auth"
import { graphql } from "gql.tada"
import { useEffect } from "react"

type Props = {
  children: React.ReactNode
}

export const AutoLoginProvider = (props: Props) => {
  const [mutation, { loading: isLoading }] = useMutation(
    loginWithWordPressTokenMutation,
  )

  useEffect(() => {
    // 未ログイン
    if (typeof document === "undefined") return

    const currentUser = getAuth().currentUser

    if (currentUser === null) {
      autoLogin()
    }
  }, [])

  const autoLogin = async () => {
    const token = getCookieLoginToken()
    if (token !== null) {
      // トークンがある場合はログイン処理を行う
      await mutation({
        variables: {
          input: {
            token: token,
          },
        },
      }).then(async (result) => {
        const token = result.data?.loginWithWordPressToken.token ?? null
        if (token === null) {
          return
        }
        await signInWithCustomToken(getAuth(), token)
      })
    }
  }

  return <>{props.children}</>
}

const loginWithWordPressTokenMutation = graphql(
  `mutation LoginWithWordPressToken($input: LoginWithWordPressTokenInput!) {
    loginWithWordPressToken(input: $input) {
      token
    }
  }`,
)
