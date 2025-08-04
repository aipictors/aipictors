import { getCookieLoginToken } from "~/utils/get-cookie-login-token"
import { useMutation } from "@apollo/client/index"
import { getAuth, signInWithCustomToken } from "firebase/auth"
import { graphql } from "gql.tada"
import { useEffect, useState } from "react"

type Props = {
  children: React.ReactNode
}

export function AutoLoginProvider(props: Props) {
  const [mutation] = useMutation(loginWithWordPressTokenMutation)
  const [isClientMounted, setIsClientMounted] = useState(false)

  // クライアントマウント検出
  useEffect(() => {
    setIsClientMounted(true)
  }, [])

  useEffect(() => {
    // クライアントサイドでのみ自動ログインを実行
    if (!isClientMounted || typeof document === "undefined") return

    // 遅延実行で自動ログインを処理
    const timeoutId = setTimeout(() => {
      try {
        const currentUser = getAuth().currentUser
        if (currentUser === null) {
          autoLogin()
        }
      } catch (error) {
        console.warn("Auto login check failed:", error)
      }
    }, 500) // より長い遅延で確実性を高める

    return () => clearTimeout(timeoutId)
  }, [isClientMounted])

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
