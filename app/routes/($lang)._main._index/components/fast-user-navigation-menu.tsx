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

  // 基本情報のみ先に取得（キャッシュ優先）
  const { data } = useQuery(viewerBasicUserQuery, {
    skip: authContext.isNotLoggedIn,
    errorPolicy: "ignore",
    fetchPolicy: "cache-first",
  })

  // 認証情報から最低限の表示
  const iconUrl =
    data?.viewer?.user?.iconUrl ?? authContext.avatarPhotoURL ?? ""
  const displayName = data?.viewer?.user?.name ?? authContext.displayName ?? ""

  if (authContext.isNotLoggedIn) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={withIconUrlFallback(iconUrl)} />
          <AvatarFallback>
            {displayName ? displayName.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* Suspenseでスムーズに表示 - チカチカを防ぐ */}
        <Suspense
          fallback={
            <div className="min-w-[280px] p-4">
              <div className="animate-pulse space-y-3">
                {/* ヘッダー部分のスケルトン */}
                <div className="mb-4 h-16 w-full rounded-md bg-gray-200" />
                {/* フォロー/フォロワー部分のスケルトン */}
                <div className="flex gap-x-2">
                  <div className="h-8 w-16 rounded bg-gray-200" />
                  <div className="h-8 w-16 rounded bg-gray-200" />
                </div>
                {/* メニューアイテムのスケルトン */}
                <div className="h-6 w-full rounded bg-gray-200" />
                <div className="h-6 w-full rounded bg-gray-200" />
                <div className="h-6 w-full rounded bg-gray-200" />
                <div className="h-6 w-full rounded bg-gray-200" />
                <div className="h-6 w-full rounded bg-gray-200" />
                <div className="h-6 w-full rounded bg-gray-200" />
              </div>
            </div>
          }
        >
          <UserNavigationMenuContent onLogout={props.onLogout} />
        </Suspense>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
