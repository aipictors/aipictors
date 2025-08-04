import { getCookieLoginToken } from "~/utils/get-cookie-login-token"
import { useMutation } from "@apollo/client/index"
import { getAuth, signInWithCustomToken } from "firebase/auth"
import { graphql } from "gql.tada"
import { useEffect } from "react"

type Props = {
  children: React.ReactNode
}

export function AutoLoginProvider(props: Props) {
  const [mutation] = useMutation(loginWithWordPressTokenMutation)

  useEffect(() => {
    // 未ログイン時のみ自動ログインを試行
    if (typeof document === "undefined") return

    // より高速化：requestIdleCallbackで優先度を下げて実行
    const callback = () => {
      const currentUser = getAuth().currentUser

      if (currentUser === null) {
        autoLogin()
      }
    }

    if ("requestIdleCallback" in window) {
      requestIdleCallback(callback)
    } else {
      // fallback for browsers without requestIdleCallback
      setTimeout(callback, 50)
    }
  }, [])

  const autoLogin = async () => {
    try {
      const token = getCookieLoginToken()
      if (token !== null) {
        // トークンがある場合はログイン処理を行う
        const result = await mutation({
          variables: {
            input: {
              token: token,
            },
          },
        })

        const firebaseToken = result.data?.loginWithWordPressToken.token ?? null
        if (firebaseToken === null) {
          return
        }
        await signInWithCustomToken(getAuth(), firebaseToken)
      }
    } catch (error) {
      // エラーログ出力は最小限に
      console.warn("Auto login failed:", error)
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
