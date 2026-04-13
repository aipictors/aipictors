import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { useState, useContext } from "react"
import { useQuery, useMutation } from "@apollo/client/index"
import { Button, buttonVariants } from "~/components/ui/button"
import { AdminPageShell } from "~/components/admin-page-shell"
import { Input } from "~/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Separator } from "~/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { Search, UserX, MessageSquareOff, ImageOff, Users } from "lucide-react"
import { AuthContext } from "~/contexts/auth-context"
import { graphql } from "gql.tada"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "ユーザ管理",
      enTitle: "User Moderation",
      description: "モデレーター専用のユーザ管理ページ",
      enDescription: "Moderator-only user moderation page",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

// GraphQLクエリ: 現在のユーザー情報とモデレーター権限を取得
const ViewerQuery = graphql(`
  query Viewer {
    viewer {
      id
      isModerator
    }
  }
`)

// GraphQLクエリ: モデレーション用のユーザー情報を取得（ID検索）
const GetUserForModerationQuery = graphql(`
  query GetUserForModeration($userId: ID!) {
    user(id: $userId) {
      id
      name
      login
      isCommentBanned
      isPostBanned
    }
  }
`)

// GraphQLクエリ: モデレーション用のユーザー情報を取得（ログイン名検索）
const GetUserByLoginQuery = graphql(`
  query GetUserByLogin($where: UsersWhereInput!) {
    users(offset: 0, limit: 1, where: $where) {
      id
      name
      login
      isCommentBanned
      isPostBanned
    }
  }
`)

// GraphQLミューテーション: コメントBAN切り替え
const ToggleUserCommentBanMutation = graphql(
  `mutation ToggleUserCommentBan($input: ToggleUserCommentBanInput!) {
    toggleUserCommentBan(input: $input)
  }`,
)

// GraphQLミューテーション: 投稿BAN切り替え
const ToggleUserPostBanMutation = graphql(
  `mutation ToggleUserPostBan($input: ToggleUserPostBanInput!) {
    toggleUserPostBan(input: $input)
  }`,
)

type BanAction = "toggleCommentBan" | "togglePostBan"

type LoaderData = {
  searchUserId?: string
}

export async function loader({ request }: LoaderFunctionArgs) {
  // URLパラメータからsearchUserIdのみを取得してクライアントに渡す
  const url = new URL(request.url)
  const searchUserId = url.searchParams.get("userId")

  return json<LoaderData>({ searchUserId: searchUserId || undefined })
}

const pageDescription = "コメントBAN・投稿BANの確認と切り替えを行います。"

export default function AdminUsersPage () {
  const { searchUserId } = useLoaderData<typeof loader>()
  const authContext = useContext(AuthContext)
  const [inputUserId, setInputUserId] = useState(searchUserId || "")
  const [searchedUserId, setSearchedUserId] = useState(searchUserId || "")

  // 現在のユーザー情報とモデレーター権限を取得
  const { data: viewerData, loading: viewerLoading } = useQuery(ViewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  // 入力値が数字かどうかを判定
  const isNumericId = /^\d+$/.test(searchedUserId)

  // 検索されたユーザー情報を取得（ID検索）
  const {
    data: userDataById,
    loading: userLoadingById,
    error: userErrorById,
  } = useQuery(GetUserForModerationQuery, {
    variables: { userId: searchedUserId },
    skip:
      authContext.isLoading ||
      !searchedUserId ||
      !isNumericId ||
      !viewerData?.viewer?.isModerator,
  })

  // 検索されたユーザー情報を取得（ログイン名検索）
  const {
    data: userDataByLogin,
    loading: userLoadingByLogin,
    error: userErrorByLogin,
  } = useQuery(GetUserByLoginQuery, {
    variables: { where: { search: searchedUserId } },
    skip:
      authContext.isLoading ||
      !searchedUserId ||
      isNumericId ||
      !viewerData?.viewer?.isModerator,
  })

  // どちらかのクエリ結果を使用
  const userLoading = isNumericId ? userLoadingById : userLoadingByLogin
  const userError = isNumericId ? userErrorById : userErrorByLogin // ユーザー情報を取得
  type UserType = {
    id: string
    name: string
    login: string
    isCommentBanned: boolean
    isPostBanned: boolean
  }

  let user: UserType | null = null
  if (isNumericId && userDataById?.user) {
    user = userDataById.user as UserType
  } else if (!isNumericId && userDataByLogin?.users?.[0]) {
    user = userDataByLogin.users[0] as UserType
  }

  // コメントBAN切り替えミューテーション
  const [toggleCommentBan, { loading: commentBanLoading }] = useMutation(
    ToggleUserCommentBanMutation,
    {
      onCompleted: () => {
        // 成功後にユーザー情報を再取得
        window.location.reload()
      },
    },
  )

  // 投稿BAN切り替えミューテーション
  const [togglePostBan, { loading: postBanLoading }] = useMutation(
    ToggleUserPostBanMutation,
    {
      onCompleted: () => {
        // 成功後にユーザー情報を再取得
        window.location.reload()
      },
    },
  )

  const handleSearch = () => {
    if (!inputUserId.trim()) return

    setSearchedUserId(inputUserId.trim())
    const searchParams = new URLSearchParams()
    searchParams.set("userId", inputUserId.trim())
    window.history.pushState({}, "", `?${searchParams.toString()}`)
  }

  const handleBanToggle = async (actionType: BanAction) => {
    if (!searchedUserId || !user) return

    try {
      if (actionType === "toggleCommentBan") {
        await toggleCommentBan({
          variables: {
            input: {
              targetUserId: searchedUserId,
              isBanned: !user.isCommentBanned,
            },
          },
        })
      } else if (actionType === "togglePostBan") {
        await togglePostBan({
          variables: {
            input: {
              targetUserId: searchedUserId,
              isBanned: !user.isPostBanned,
            },
          },
        })
      }
    } catch (error) {
      console.error("BAN操作エラー:", error)
    }
  }

  // ローディング中
  if (authContext.isLoading || viewerLoading) {
    return (
      <AdminPageShell
        title="ユーザ管理"
        description={pageDescription}
        icon={Users}
      >
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-white/10" />
          <div className="h-64 rounded-[28px] bg-white/5" />
        </div>
      </AdminPageShell>
    )
  }

  // 未ログイン
  if (authContext.isNotLoggedIn) {
    return (
      <AdminPageShell
        title="ユーザ管理"
        description={pageDescription}
        icon={Users}
      >
        <Alert className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
          <AlertDescription className="text-slate-300">
            このページにアクセスするにはログインが必要です。
          </AlertDescription>
        </Alert>
      </AdminPageShell>
    )
  }

  // モデレーター権限なし
  if (!viewerData?.viewer?.isModerator) {
    return (
      <AdminPageShell
        title="ユーザ管理"
        description={pageDescription}
        icon={Users}
      >
        <Alert className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
          <AlertDescription className="text-slate-300">
            このページにアクセスする権限がありません。
          </AlertDescription>
        </Alert>
      </AdminPageShell>
    )
  }

  return (
    <AdminPageShell
      title="ユーザ管理"
      description={pageDescription}
      icon={Users}
    >
      <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>ユーザー検索</span>
          </CardTitle>
          <CardDescription>
            ユーザーIDで検索してBAN操作を行います
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="flex-1">
              <label htmlFor="userId" className="sr-only">
                ユーザーID
              </label>
              <Input
                id="userId"
                type="text"
                placeholder="ユーザーIDを入力"
                value={inputUserId}
                onChange={(e) => setInputUserId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  }
                }}
                className="w-full border-white/10 bg-slate-950/40 text-slate-100"
              />
            </div>
            <Button onClick={handleSearch} disabled={!inputUserId.trim()}>
              <Search className="mr-2 h-4 w-4" />
              検索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* エラー表示 */}
      {userError && (
        <Alert className="rounded-[28px] border-rose-300/20 bg-rose-500/10 text-rose-100">
          <AlertDescription className="text-rose-100">
            ユーザー情報の取得に失敗しました: {userError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* ユーザー情報表示セクション */}
      {userLoading && searchedUserId && (
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-cyan-300" />
            <p className="text-slate-400">ユーザー情報を読み込み中...</p>
          </CardContent>
        </Card>
      )}

      {user && (
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserX className="h-5 w-5" />
              <span>ユーザー情報</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ユーザー基本情報 */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <p className="font-medium text-slate-400 text-sm">ユーザーID</p>
                <p className="font-mono text-sm">{user.id}</p>
              </div>
              <div>
                <p className="font-medium text-slate-400 text-sm">ユーザー名</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="font-medium text-slate-400 text-sm">ログイン名</p>
                <p className="font-mono text-sm">@{user.login}</p>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* BAN状態表示 */}
            <div>
              <h3 className="mb-4 font-semibold text-lg">現在のBAN状態</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <div className="flex items-center space-x-2">
                    <MessageSquareOff className="h-5 w-5 text-slate-400" />
                    <span className="font-medium">コメントBAN</span>
                  </div>
                  <Badge
                    variant={user.isCommentBanned ? "destructive" : "secondary"}
                    className={user.isCommentBanned ? undefined : "bg-white/10 text-slate-200"}
                  >
                    {user.isCommentBanned ? "BAN中" : "正常"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <div className="flex items-center space-x-2">
                    <ImageOff className="h-5 w-5 text-slate-400" />
                    <span className="font-medium">投稿BAN</span>
                  </div>
                  <Badge
                    variant={user.isPostBanned ? "destructive" : "secondary"}
                    className={user.isPostBanned ? undefined : "bg-white/10 text-slate-200"}
                  >
                    {user.isPostBanned ? "BAN中" : "正常"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* BAN操作ボタン */}
            <div>
              <h3 className="mb-4 font-semibold text-lg">BAN操作</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant={user.isCommentBanned ? "destructive" : "outline"}
                      className="w-full"
                      disabled={commentBanLoading}
                    >
                      <MessageSquareOff className="mr-2 h-4 w-4" />
                      {commentBanLoading
                        ? "処理中..."
                        : `コメントBAN${user.isCommentBanned ? "解除" : "設定"}`}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-white/10 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {user.isCommentBanned
                          ? "コメントBAN解除"
                          : "コメントBAN設定"}
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        {user.isCommentBanned
                          ? `ユーザー「${user.name}」(@${user.login})のコメントBANを解除しますか？`
                          : `ユーザー「${user.name}」(@${user.login})をコメントBANしますか？`}
                        <br />
                        この操作は取り消すことができます。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white">
                        キャンセル
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleBanToggle("toggleCommentBan")}
                        className={[
                          buttonVariants({
                            variant: user.isCommentBanned
                              ? "default"
                              : "destructive",
                          }),
                          user.isCommentBanned
                            ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                            : "bg-rose-600 hover:bg-rose-500",
                        ].join(" ")}
                      >
                        {user.isCommentBanned ? "BAN解除" : "BAN設定"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant={user.isPostBanned ? "destructive" : "outline"}
                      className="w-full"
                      disabled={postBanLoading}
                    >
                      <ImageOff className="mr-2 h-4 w-4" />
                      {postBanLoading
                        ? "処理中..."
                        : `投稿BAN${user.isPostBanned ? "解除" : "設定"}`}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-white/10 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {user.isPostBanned ? "投稿BAN解除" : "投稿BAN設定"}
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        {user.isPostBanned
                          ? `ユーザー「${user.name}」(@${user.login})の投稿BANを解除しますか？`
                          : `ユーザー「${user.name}」(@${user.login})を投稿BANしますか？`}
                        <br />
                        この操作は取り消すことができます。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white">
                        キャンセル
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleBanToggle("togglePostBan")}
                        className={[
                          buttonVariants({
                            variant: user.isPostBanned
                              ? "default"
                              : "destructive",
                          }),
                          user.isPostBanned
                            ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                            : "bg-rose-600 hover:bg-rose-500",
                        ].join(" ")}
                      >
                        {user.isPostBanned ? "BAN解除" : "BAN設定"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 検索が実行されていない場合の案内 */}
      {!searchedUserId && (
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-slate-500" />
            <p className="text-slate-400">
              ユーザーIDを入力して検索してください
            </p>
          </CardContent>
        </Card>
      )}

      {/* ユーザーが見つからない場合 */}
      {searchedUserId && !userLoading && !user && !userError && (
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-12 text-center">
            <UserX className="mx-auto mb-4 h-12 w-12 text-slate-500" />
            <p className="text-slate-400">ユーザーが見つかりませんでした</p>
          </CardContent>
        </Card>
      )}
    </AdminPageShell>
  )
}
