import { AuthContext } from "~/contexts/auth-context"
import { config } from "~/config"
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

export function AuthContextProvider(props: Props) {
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

    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (user === null) {
        setCurrentUser(null)
        setClaims(null)
        setLoadingState(false)
        return
      }

      // Analytics は遅延で設定
      requestIdleCallback(() => {
        try {
          setUserId(getAnalytics(), user?.uid ?? null)
          logEvent(getAnalytics(), config.logEvent.login, {
            method: user.providerId,
          })
        } catch (error) {
          console.warn("Analytics error:", error)
        }
      })

      getIdTokenResult(user, true).then((result) => {
        // Analytics のユーザープロパティ設定も遅延実行
        requestIdleCallback(() => {
          try {
            setUserProperties(getAnalytics(), {
              display_name: user.displayName,
              provider_id: user.providerId,
              username: result.claims.username,
            })
          } catch (error) {
            console.warn("Analytics user properties error:", error)
          }
        })

        setCurrentUser(user)
        setClaims({ ...result.claims })
        setLoadingState(false)
      })
    })

    return () => unsubscribe()
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
