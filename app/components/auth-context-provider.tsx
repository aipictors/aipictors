import { AuthContext } from "~/contexts/auth-context"
import { config } from "~/config"
import { debugLog } from "~/utils/debug-logger"
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

    // モバイル端末の検出
    const isMobile =
      typeof navigator !== "undefined" &&
      /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )

    debugLog.auth("AuthContextProvider: Setting up auth listener", {
      isMobile,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "SSR",
      viewport:
        typeof window !== "undefined"
          ? { width: window.innerWidth, height: window.innerHeight }
          : "SSR",
    })

    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      debugLog.auth("AuthStateChanged:", {
        hasUser: !!user,
        userId: user?.uid,
        displayName: user?.displayName,
        email: user?.email,
        isMobile,
        timestamp: new Date().toISOString(),
      })

      if (user === null) {
        setCurrentUser(null)
        setClaims(null)
        setLoadingState(false)
        debugLog.auth("User logged out - state cleared")
        return
      }

      // Analytics は遅延で設定（モバイル端末のパフォーマンス最適化）
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(
          () => {
            try {
              if (typeof window !== "undefined") {
                setUserId(getAnalytics(), user?.uid ?? null)
                logEvent(getAnalytics(), config.logEvent.login, {
                  method: user.providerId,
                })
              }
            } catch (error) {
              console.warn("Analytics error:", error)
            }
          },
          { timeout: 5000 }, // 5秒でタイムアウト
        )
      } else {
        // requestIdleCallbackが使用できない場合は即座にバックグラウンドで実行
        setTimeout(() => {
          try {
            if (typeof window !== "undefined") {
              setUserId(getAnalytics(), user?.uid ?? null)
              logEvent(getAnalytics(), config.logEvent.login, {
                method: user.providerId,
              })
            }
          } catch (error) {
            console.warn("Analytics error:", error)
          }
        }, 100)
      }

      // トークン取得を並行して実行し、UIの表示を優先（モバイル最適化）
      const isMobileDevice =
        typeof navigator !== "undefined" &&
        /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        )

      // モバイル端末では短いタイムアウトでより早くフォールバック
      const tokenTimeout = isMobileDevice ? 1500 : 2000

      Promise.race([
        getIdTokenResult(user, true),
        // モバイル端末では1.5秒、その他は2秒でタイムアウトし、基本情報のみで進む
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Token timeout")), tokenTimeout),
        ),
      ])
        .then((result) => {
          const tokenResult = result as Awaited<
            ReturnType<typeof getIdTokenResult>
          >

          // Analytics のユーザープロパティ設定も遅延実行（モバイル最適化）
          if (typeof requestIdleCallback !== "undefined") {
            requestIdleCallback(
              () => {
                try {
                  if (typeof window !== "undefined") {
                    setUserProperties(getAnalytics(), {
                      display_name: user.displayName,
                      provider_id: user.providerId,
                      username: tokenResult.claims.username,
                    })
                  }
                } catch (error) {
                  console.warn("Analytics user properties error:", error)
                }
              },
              { timeout: 5000 }, // 5秒でタイムアウト
            )
          } else {
            setTimeout(() => {
              try {
                if (typeof window !== "undefined") {
                  setUserProperties(getAnalytics(), {
                    display_name: user.displayName,
                    provider_id: user.providerId,
                    username: tokenResult.claims.username,
                  })
                }
              } catch (error) {
                console.warn("Analytics user properties error:", error)
              }
            }, 200)
          }

          setCurrentUser(user)
          setClaims({ ...tokenResult.claims })
          setLoadingState(false)
        })
        .catch((error) => {
          debugLog.auth("Failed to get token result, using basic user info:", {
            error: error.message,
            isMobile: isMobileDevice,
          })
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

          // バックグラウンドで再試行（モバイル端末では少し遅延）
          const retryDelay = isMobileDevice ? 2000 : 1000
          setTimeout(() => {
            getIdTokenResult(user, true)
              .then((result) => {
                setClaims({ ...result.claims })
                debugLog.auth("Token retry succeeded")
              })
              .catch(() => {
                debugLog.auth("Token retry also failed")
              })
          }, retryDelay)
        })
    })

    return () => unsubscribe()
  }, [])

  // 読み込み中
  if (isLoading) {
    debugLog.auth("AuthContext: Loading state")
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
    debugLog.auth("AuthContext: Not logged in", {
      hasCurrentUser: !!currentUser,
      hasClaims: !!claims,
      claimsUserId: claims?.userId,
      claimsSub: claims?.sub,
    })
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

  debugLog.auth("AuthContext: Logged in", {
    userId,
    login,
    displayName,
    avatarPhotoURL: !!avatarPhotoURL,
    isMobile:
      typeof navigator !== "undefined" &&
      /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ),
  })

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
