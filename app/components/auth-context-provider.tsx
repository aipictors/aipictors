import { AuthContext } from "@/contexts/auth-context"
import { config } from "@/config"
import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
} from "firebase/analytics"
import {
  type ParsedToken,
  type User,
  getAuth,
  getIdTokenResult,
  onAuthStateChanged,
} from "firebase/auth"
import { useEffect, useState } from "react"

type Props = {
  children: React.ReactNode
}

type Claims = ParsedToken

export const AuthContextProvider = (props: Props) => {
  const [isLoading, setLoadingState] = useState(() => {
    return true
  })

  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const [claims, setClaims] = useState<Claims | null>(null)

  const refresh = async () => {
    const currentUser = getAuth().currentUser
    if (currentUser === null) {
      setCurrentUser(null)
      setClaims(null)
      return
    }
    getIdTokenResult(currentUser, true).then((result) => {
      setCurrentUser(currentUser)
      setClaims({ ...result.claims })
    })
  }

  useEffect(() => {
    if (typeof document === "undefined") return
    onAuthStateChanged(getAuth(), (user) => {
      setUserId(getAnalytics(), user?.uid ?? null)
      if (user === null) {
        setCurrentUser(null)
        setClaims(null)
        setLoadingState(false)
        return
      }
      logEvent(getAnalytics(), config.logEvent.login, {
        method: user.providerId,
      })
      getIdTokenResult(user, true).then((result) => {
        // setUser({
        //   id: user.uid,
        //   username: user.uid,
        //   email: user.email ?? undefined,
        //   display_name: user.displayName,
        //   provider_id: user.providerId,
        // })
        setUserProperties(getAnalytics(), {
          display_name: user.displayName,
          provider_id: user.providerId,
          username: result.claims.username,
        })
        setCurrentUser(user)
        setClaims({ ...result.claims })
        setLoadingState(false)
      })
    })
  }, [])

  // 読み込み中
  if (isLoading) {
    const value = {
      isLoading: true,
      isNotLoading: false,
      isLoggedIn: false,
      isNotLoggedIn: false,
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

  // 未ログイン
  if (
    currentUser === null ||
    claims === null ||
    typeof claims.userId !== "string"
  ) {
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
    userId: claims.userId,
    login: claims.login as string,
    displayName: claims.name as string,
    avatarPhotoURL: claims.picture as string,
    refresh: refresh,
  } as const

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  )
}
