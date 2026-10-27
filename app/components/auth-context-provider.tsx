import { AuthContext } from "~/contexts/auth-context"
import { config } from "~/config"
import { debugLog } from "~/utils/debug-logger"
import {
  type ParsedToken,
  type User,
  getAuth,
  getIdTokenResult,
  onAuthStateChanged,
} from "firebase/auth"
import { useEffect, useState } from "react"
import { withFirebaseAnalytics } from "~/utils/run-after-load-idle"

type Props = {
  children: React.ReactNode
}

type Claims = ParsedToken

export function AuthContextProvider (props: Props): React.ReactNode {
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
      // 明示的な更新なので claims が古い可能性を考えて強制リフレッシュする
      const result = await getIdTokenResult(currentUser, true)
      setCurrentUser(currentUser)
      setClaims({ ...result.claims })
    } catch (error) {
      // 失敗しても今の claims は残す（ここで null にすると未ログイン表示になる）
      console.warn("Failed to get ID token result:", error)
      setCurrentUser(currentUser)
    }
  }

  useEffect(() => {
    if (typeof document === "undefined") return

    let isAuthStateResolved = false

    // 今トークンを取得している対象のユーザー（ログアウトや別ユーザーに切り替わったら古い結果は捨てる）
    let activeUser: User | null = null
    let hasClaims = false
    let isFetching = false
    let retryCount = 0
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let loadingCapTimer: ReturnType<typeof setTimeout> | null = null

    const clearTimers = () => {
      if (retryTimer !== null) clearTimeout(retryTimer)
      if (loadingCapTimer !== null) clearTimeout(loadingCapTimer)
      retryTimer = null
      loadingCapTimer = null
    }

    // onAuthStateChanged が返ってこないケース向けのフェイルセーフ。
    // モバイルブラウザで稀に初期化が止まる場合でも、永久ローディングを避ける。
    const initialAuthTimeout = setTimeout(() => {
      if (isAuthStateResolved) return

      debugLog.auth("AuthContextProvider: auth init timeout fallback")
      setCurrentUser(null)
      setClaims(null)
      setLoadingState(false)
    }, 8000)

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

    /**
     * ID トークンの claims を取得する。
     * force なしなので、保存済みのトークンが有効ならネットワークなしで返り、
     * 期限切れのときだけ Firebase が自動で更新する。
     * 失敗したら指数バックオフで、ユーザーがいる間は取れるまで再試行する。
     */
    const fetchClaims = (user: User) => {
      if (activeUser !== user || isFetching) return
      isFetching = true
      if (retryTimer !== null) {
        clearTimeout(retryTimer)
        retryTimer = null
      }

      getIdTokenResult(user)
        .then((tokenResult) => {
          if (activeUser !== user) return
          hasClaims = true
          retryCount = 0
          clearTimers()

          setClaims({ ...tokenResult.claims })
          setLoadingState(false)
          debugLog.auth("Token details updated successfully")

          // Analytics のユーザープロパティ設定も遅延実行（モバイル最適化）
          withFirebaseAnalytics(({ getAnalytics, setUserProperties }) => {
            setUserProperties(getAnalytics(), {
              display_name: user.displayName,
              provider_id: user.providerId,
              username: tokenResult.claims.username,
            })
          })
        })
        .catch((error) => {
          if (activeUser !== user) return
          // 1秒, 2秒, 4秒…と間隔を空け、最大30秒ごとに再試行し続ける
          const delay = Math.min(1000 * 2 ** retryCount, 30000)
          retryCount += 1
          debugLog.auth("Token details fetch failed (will retry):", {
            error: error instanceof Error ? error.message : String(error),
            retryCount,
            delay,
            isMobile,
          })
          retryTimer = setTimeout(() => {
            retryTimer = null
            fetchClaims(user)
          }, delay)
        })
        .finally(() => {
          isFetching = false
        })
    }

    // 回線が戻ったときや画面に戻ってきたときは待たずに取り直す
    const retryNow = () => {
      if (activeUser === null || hasClaims) return
      if (document.visibilityState === "hidden") return
      retryCount = 0
      fetchClaims(activeUser)
    }

    window.addEventListener("online", retryNow)
    document.addEventListener("visibilitychange", retryNow)

    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      isAuthStateResolved = true
      clearTimeout(initialAuthTimeout)
      clearTimers()
      activeUser = user
      hasClaims = false
      isFetching = false
      retryCount = 0

      debugLog.auth("AuthStateChanged:", {
        hasUser: !!user,
        userId: user?.uid,
        displayName: user?.displayName,
        email: user?.email,
        isMobile,
        timestamp: new Date().toISOString(),
      })

      // 未ログイン表示にするのは、実際にログアウトしている（user が null）ときだけ
      if (user === null) {
        setCurrentUser(null)
        setClaims(null)
        setLoadingState(false)
        debugLog.auth("User logged out - state cleared")
        return
      }

      // Analytics は読み込み完了後のアイドル時に設定（モバイル端末のパフォーマンス最適化）
      withFirebaseAnalytics(({ getAnalytics, logEvent, setUserId }) => {
        setUserId(getAnalytics(), user?.uid ?? null)
        logEvent(getAnalytics(), config.logEvent.login, {
          method: user.providerId,
        })
      })

      // Firebase user だけでは API 認証に必要な ID token の有効性を保証できない。
      // logged-in 状態は getIdTokenResult が成功した後にだけ公開する。
      // 取得中は未ログインではなく読み込み中として扱う（ログインボタンを出さない）。
      setCurrentUser(user)
      setClaims(null)
      setLoadingState(true)

      // 8秒たってもトークンが取れない（オフラインで期限切れなど）ときは、
      // 保存済みトークンの claims でログイン表示にして、裏で再試行を続ける。
      // 保存済みトークンも読めなければ読み込み中のまま再試行を続ける。
      loadingCapTimer = setTimeout(() => {
        loadingCapTimer = null
        if (activeUser !== user || hasClaims) return
        const cachedClaims = readCachedClaims(user)
        debugLog.auth("Token fetch is slow - fallback to cached claims", {
          hasCachedClaims: cachedClaims !== null,
        })
        if (cachedClaims === null) return
        setClaims(cachedClaims)
        setLoadingState(false)
      }, 8000)

      // モバイル軽量ログ
      debugLog.mobileLite(`Auth: Verifying token for ${user.uid}`)

      fetchClaims(user)
    })

    return () => {
      clearTimeout(initialAuthTimeout)
      clearTimers()
      activeUser = null
      window.removeEventListener("online", retryNow)
      document.removeEventListener("visibilitychange", retryNow)
      unsubscribe()
    }
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

/**
 * 端末に保存済みの ID トークン（期限切れでもよい）から claims を読む。
 * ネットワークなしで表示だけ維持するためのもので、署名の検証はしない。
 */
function readCachedClaims(user: User): Claims | null {
  try {
    const json = user.toJSON() as {
      stsTokenManager?: { accessToken?: unknown }
    }
    const token = json.stsTokenManager?.accessToken
    if (typeof token !== "string") return null
    const payload = token.split(".")[1]
    if (payload === undefined) return null
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
    const claims = JSON.parse(new TextDecoder().decode(bytes))
    if (typeof claims !== "object" || claims === null) return null
    return claims as Claims
  } catch {
    return null
  }
}
