"use client"

import { getCookieLoginToken } from "@/app/_utils/get-cookie-login-token"
import { loginWithWordPressTokenMutation } from "@/graphql/mutations/login-with-wordpress-token"
import { useMutation } from "@apollo/client"
import { getAuth, signInWithCustomToken } from "firebase/auth"
import { useEffect } from "react"
import { toast } from "sonner"

type Props = {
  children: React.ReactNode
}

export const AutoLoginProvider = (props: Props) => {
  const currentUser = getAuth().currentUser

  const [mutation, { loading: isLoading }] = useMutation(
    loginWithWordPressTokenMutation,
  )

  useEffect(() => {
    // 未ログイン
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
        toast("自動ログインしました。")
      })
    }
  }

  return <>{props.children}</>
}
