"use client"

import { AuthContext } from "@/lib/auth/contexts/auth-context"
import { getCurrentUserInClient } from "@/lib/auth/get-current-user-in-client"
import { useState } from "react"

type Props = {
  children: React.ReactNode
}

export const AuthProvider = (props: Props) => {
  const [state, setState] = useState(() => {
    return getCurrentUserInClient()
  })

  const refresh = async () => {
    setState(getCurrentUserInClient())
  }

  // 未ログイン
  if (state === null) {
    const value = {
      isLoading: false,
      isNotLoading: true,
      isLoggedIn: false,
      isNotLoggedIn: true,
      userId: null,
      login: null,
      displayName: null,
      avatarPhotoURL: null,
      refresh: refresh,
    } as const
    return (
      <AuthContext.Provider value={value}>
        {props.children}
      </AuthContext.Provider>
    )
  }

  const value = {
    isLoading: false,
    isNotLoading: true,
    isLoggedIn: true,
    isNotLoggedIn: false,
    userId: state.userId as string,
    login: state.login as string,
    displayName: state.name as string,
    avatarPhotoURL: state.picture as string,
    refresh: refresh,
  } as const

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  )
}
