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

    // パフォーマンス改善：遅延実行で自動ログインを処理
    const timeoutId = setTimeout(() => {
      const currentUser = getAuth().currentUser

      if (currentUser === null) {
        autoLogin()
      }
    }, 100) // 100ms遅延で実行

    return () => clearTimeout(timeoutId)
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
