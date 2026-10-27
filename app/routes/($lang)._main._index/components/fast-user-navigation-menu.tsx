import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { AuthContext } from "~/contexts/auth-context"
import { useContext, useState } from "react"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useQuery } from "@apollo/client/index"
import { viewerBasicUserQuery } from "~/routes/($lang)._main._index/components/user-navigation-queries"
import { debugLog } from "~/utils/debug-logger"

import UserNavigationMenuContent, {
  prefetchUserNavigationMenu,
} from "~/routes/($lang)._main._index/components/user-navigation-menu-content"
import { useApolloClient } from "@apollo/client/index"

type Props = {
  onLogout(): void
}

/**
 * ファストローディング用のシンプルなユーザーナビゲーションメニュー
 * 認証情報から最低限のUIを表示し、詳細情報は遅延読み込み
 */
export function FastUserNavigationMenu(props: Props) {
  const authContext = useContext(AuthContext)
  const [isOpen, setIsOpen] = useState(false)

  // 基本情報のみ先に取得（キャッシュ優先、モバイル最適化）
  const { data } = useQuery(viewerBasicUserQuery, {
    skip: authContext.isNotLoggedIn,
    errorPolicy: "ignore",
    fetchPolicy: "cache-first",
    // モバイル端末では更に短いタイムアウト
    context: {
      timeout:
        typeof navigator !== "undefined" &&
        /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        )
          ? 2000 // モバイルは2秒
          : 4000, // デスクトップは4秒
    },
    notifyOnNetworkStatusChange: false, // ネットワーク状態変更通知を無効化（パフォーマンス向上）
  })

  const client = useApolloClient()

  // メニューの中身（ユーザー情報・設定）はアイコンにカーソルを乗せた・触れたときに先に取っておく
  // （全ページで読み込み後に取りに行くと API の負荷になるため）

  // 認証情報から最低限の表示
  const iconUrl =
    data?.viewer?.user?.iconUrl ?? authContext.avatarPhotoURL ?? ""
  const displayName = data?.viewer?.user?.name ?? authContext.displayName ?? ""
  const avatarFrame = data?.viewer?.user?.avatarFrame ?? null

  // デバッグ用ログ（モバイル含む詳細情報）
  debugLog.user("FastUserNavigationMenu render:", {
    isOpen,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "SSR",
    viewport:
      typeof window !== "undefined"
        ? { width: window.innerWidth, height: window.innerHeight }
        : "SSR",
    authContext: {
      isLoggedIn: authContext.isLoggedIn,
      isNotLoggedIn: authContext.isNotLoggedIn,
      isLoading: authContext.isLoading,
      userId: authContext.userId,
      login: authContext.login,
      displayName: authContext.displayName,
      avatarPhotoURL: authContext.avatarPhotoURL,
    },
    queryData: {
      hasData: !!data,
      iconUrl: data?.viewer?.user?.iconUrl,
      login: data?.viewer?.user?.login,
    },
    fallbackData: {
      iconUrl,
      displayName,
    },
  })

  // モバイル用軽量ログ
  debugLog.mobileLite(
    `FastUserNav: ${authContext.isLoggedIn ? "logged-in" : "loading"}`,
  )

  if (authContext.isNotLoggedIn) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full"
          aria-label="メニュー"
          onPointerEnter={() => prefetchUserNavigationMenu(client)}
          onPointerDown={() => prefetchUserNavigationMenu(client)}
          onFocus={() => prefetchUserNavigationMenu(client)}
        >
          <UserAvatarWithFrame
            alt={displayName || "User"}
            frame={avatarFrame}
            sizeClassName="h-10 w-10 cursor-pointer"
            src={withIconUrlFallback(iconUrl)}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <UserNavigationMenuContent onLogout={props.onLogout} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
