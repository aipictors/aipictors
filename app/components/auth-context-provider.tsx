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
    try {
      const result = await getIdTokenResult(currentUser, true)
      setCurrentUser(currentUser)
      setClaims({ ...result.claims })
    } catch (error) {
      console.warn("Failed to get ID token result:", error)
      // エラーの場合でも基本的なユーザー情報は設定
      setCurrentUser(currentUser)
      setClaims(null)
    }
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

      // トークン取得を並行して実行し、UIの表示を優先
      Promise.race([
        getIdTokenResult(user, true),
        // 2秒でタイムアウトし、基本情報のみで進む
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Token timeout")), 2000),
        ),
      ])
        .then((result) => {
          const tokenResult = result as Awaited<
            ReturnType<typeof getIdTokenResult>
          >

          // Analytics のユーザープロパティ設定も遅延実行
          requestIdleCallback(() => {
            try {
              setUserProperties(getAnalytics(), {
                display_name: user.displayName,
                provider_id: user.providerId,
                username: tokenResult.claims.username,
              })
            } catch (error) {
              console.warn("Analytics user properties error:", error)
            }
          })

          setCurrentUser(user)
          setClaims({ ...tokenResult.claims })
          setLoadingState(false)
        })
        .catch((error) => {
          console.warn(
            "Failed to get token result, using basic user info:",
            error,
          )
          // トークン取得に失敗した場合でも基本的なユーザー情報でUIを表示
          setCurrentUser(user)
          // 最低限のクレーム情報を構築
          setClaims({
            userId: user.uid,
            login: user.displayName || user.email?.split("@")[0] || user.uid,
            name: user.displayName || "User",
            picture: user.photoURL || null,
          } as ParsedToken)
          setLoadingState(false)

          // バックグラウンドで再試行
          setTimeout(() => {
            getIdTokenResult(user, true)
              .then((result) => {
                setClaims({ ...result.claims })
              })
              .catch(() => {
                // 再試行も失敗した場合は何もしない
              })
          }, 1000)
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
    (typeof claims.userId !== "string" && typeof claims.sub !== "string")
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

  const userId = (claims.userId || claims.sub) as string
  const login = (claims.login ||
    (claims.email as string)?.split("@")[0] ||
    userId) as string
  const displayName = (claims.name || claims.display_name || login) as string
  const avatarPhotoURL = (claims.picture || claims.avatar_url) as string

  const value = {
    isLoading: false,
    isNotLoading: true,
    isLoggedIn: true,
    isNotLoggedIn: false,
    userId: userId as string,
    login: login as string,
    displayName: displayName as string,
    avatarPhotoURL: avatarPhotoURL as string,
    refresh: refresh,
  } as const

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  )
}
