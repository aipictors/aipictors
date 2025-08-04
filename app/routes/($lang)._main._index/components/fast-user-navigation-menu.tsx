import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { AuthContext } from "~/contexts/auth-context"
import { useContext, useState, lazy, Suspense } from "react"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useQuery } from "@apollo/client/index"
import { viewerBasicUserQuery } from "~/routes/($lang)._main._index/components/user-navigation-queries"
import { debugLog } from "~/utils/debug-logger"

// 詳細なメニューコンテンツを遅延読み込み
const UserNavigationMenuContent = lazy(
  () =>
    import(
      "~/routes/($lang)._main._index/components/user-navigation-menu-content"
    ),
)

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

  // 認証情報から最低限の表示
  const iconUrl =
    data?.viewer?.user?.iconUrl ?? authContext.avatarPhotoURL ?? ""
  const displayName = data?.viewer?.user?.name ?? authContext.displayName ?? ""

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
        <Avatar className="h-10 w-10 cursor-pointer">
          <AvatarImage src={withIconUrlFallback(iconUrl)} />
          <AvatarFallback>
            {displayName ? displayName.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* UserNavigationMenuContentが自分でローディング状態を管理 */}
        <Suspense
          fallback={
            <div className="p-4 text-center text-muted-foreground text-sm">
              読み込み中...
            </div>
          }
        >
          <UserNavigationMenuContent onLogout={props.onLogout} />
        </Suspense>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
