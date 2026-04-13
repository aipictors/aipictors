import { useQuery, gql } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
import { useContext } from "react"
import {
  ArrowUpRight,
  Bell,
  FileWarning,
  LayoutGrid,
  MessageSquareWarning,
  Search,
  Shield,
  Users,
  ImageIcon,
} from "lucide-react"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "モデレーター管理",
      enTitle: "Moderator Admin",
      description: "モデレーター専用の管理ダッシュボード",
      enDescription: "Moderator-only administration dashboard",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return json({})
}

const primaryMenu = [
  {
    href: "/admin",
    title: "ダッシュボード",
    description: "管理メニューの入口",
    icon: LayoutGrid,
  },
  {
    href: "/admin/comments",
    title: "コメント審査",
    description: "通報・異議申し立ての確認",
    icon: MessageSquareWarning,
  },
  {
    href: "/admin/users",
    title: "ユーザ管理",
    description: "コメントBAN・投稿BAN",
    icon: Users,
  },
  {
    href: "/admin/works",
    title: "作品管理",
    description: "非公開処理・理由通知",
    icon: ImageIcon,
  },
] as const

const quickActions = [
  {
    href: "/admin/comments",
    title: "コメント通報一覧",
    subtitle: "報告と異議申し立てを確認",
  },
  {
    href: "/admin/users",
    title: "ユーザBAN管理",
    subtitle: "コメントBAN・投稿BANを切替",
  },
  {
    href: "/admin/works",
    title: "作品一覧管理",
    subtitle: "非公開処理と通知を実行",
  },
] as const

const operationCards = [
  {
    title: "作品モデレーション",
    description:
      "作品画面の ・・・ メニューから、モデレーター専用で作品の非公開化と投稿者通知ができます。",
    icon: FileWarning,
  },
  {
    title: "ユーザ通知確認",
    description:
      "ユーザ管理画面から対象ユーザを検索し、BAN状態や関連対応の確認ができます。",
    icon: Bell,
  },
] as const

export default function AdminDashboardPage() {
  const authContext = useContext(AuthContext)
  const { data: viewerData, loading: viewerLoading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })
  const { data: moderationData, loading: moderationLoading } = useQuery(
    adminCommentModerationItemsQuery,
    {
      skip:
        authContext.isLoading ||
        authContext.isNotLoggedIn ||
        !viewerData?.viewer?.isModerator,
    },
  )
  const { data: worksPreviewData, loading: worksPreviewLoading } = useQuery(
    adminWorksPreviewQuery,
    {
      variables: {
        offset: 0,
        limit: 6,
      },
      skip:
        authContext.isLoading ||
        authContext.isNotLoggedIn ||
        !viewerData?.viewer?.isModerator,
    },
  )

  if (authContext.isLoading || viewerLoading) {
    return <div className="container mx-auto max-w-7xl py-8" />
  }

  if (authContext.isNotLoggedIn) {
    return (
      <div className="container mx-auto max-w-5xl py-8">
        <Alert>
          <AlertDescription>このページにアクセスするにはログインが必要です。</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!viewerData?.viewer?.isModerator) {
    return (
      <div className="container mx-auto max-w-5xl py-8">
        <Alert>
          <AlertDescription>このページにアクセスする権限がありません。</AlertDescription>
        </Alert>
      </div>
    )
  }

  const moderationItems = moderationData?.adminCommentModerationItems ?? []
  const reportCount = moderationItems.filter((item: any) => item.kind === "REPORT").length
  const appealCount = moderationItems.filter((item: any) => item.kind === "APPEAL").length
  const previewWorks = worksPreviewData?.works ?? []

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#11182a_0%,#182235_100%)] text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6 lg:py-6">
        <aside className="w-full rounded-[28px] border border-white/10 bg-slate-950/35 p-4 backdrop-blur lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-[320px] lg:overflow-auto">
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                readOnly
                value="メニューを検索"
                className="border-white/10 bg-white/5 pl-9 text-slate-200"
              />
            </div>
            <p className="text-xs text-slate-400">モデレーター専用メニュー</p>
          </div>

          <Separator className="my-4 bg-white/10" />

          <nav className="space-y-3">
            {primaryMenu.map((item) => {
              const Icon = item.icon
              const isCurrent = item.href === "/admin"
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={[
                    "flex items-center gap-3 rounded-3xl border px-4 py-4 transition",
                    isCurrent
                      ? "border-indigo-300/40 bg-indigo-500/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                      : "border-white/10 bg-white/5 hover:bg-white/10",
                  ].join(" ")}
                >
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <Icon className="size-5 text-slate-100" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-white">{item.title}</div>
                    <div className="text-xs text-slate-400">{item.description}</div>
                  </div>
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 rounded-[28px] border border-white/10 bg-slate-950/25 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Shield className="size-7 text-cyan-300" />
                <h1 className="font-bold text-3xl tracking-tight">モデレーター管理</h1>
                <Badge variant="secondary" className="bg-white/10 text-slate-200">
                  noindex
                </Badge>
              </div>
              <p className="text-sm text-slate-400">
                コメント審査、ユーザ制限、作品モデレーションへの入口です。
              </p>
            </div>
          </div>

          <section className="space-y-4 py-8">
            <div>
              <h2 className="font-semibold text-2xl">よく使う</h2>
              <p className="mt-1 text-sm text-slate-400">モデレーター作業で頻度の高い管理項目です</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {quickActions.map((item) => (
                <Link key={item.href} to={item.href}>
                  <Card className="h-full rounded-[28px] border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg">
                        <span>{item.title}</span>
                        <ArrowUpRight className="size-4 text-slate-400" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-400">{item.subtitle}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          <Separator className="bg-white/10" />

          <section className="space-y-4 py-8">
            <div>
              <h2 className="font-semibold text-2xl">承認・対応待ち</h2>
              <p className="mt-1 text-sm text-slate-400">数字をクリックすると対象画面へ移動します</p>
            </div>
            <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
              <CardContent className="p-0">
                <Link
                  to="/admin/comments"
                  className="flex items-center justify-between border-b border-white/10 px-6 py-5 transition hover:bg-white/5"
                >
                  <div>
                    <div className="font-semibold text-lg">コメント通報</div>
                    <div className="text-sm text-slate-400">コメント報告の確認と対応</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-2xl">{moderationLoading ? "..." : reportCount}</div>
                    <div className="text-sm text-slate-400">未対応</div>
                  </div>
                </Link>
                <Link
                  to="/admin/comments"
                  className="flex items-center justify-between px-6 py-5 transition hover:bg-white/5"
                >
                  <div>
                    <div className="font-semibold text-lg">異議申し立て</div>
                    <div className="text-sm text-slate-400">却下コメントへの再確認</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-2xl">{moderationLoading ? "..." : appealCount}</div>
                    <div className="text-sm text-slate-400">確認待ち</div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </section>

          <Separator className="bg-white/10" />

          <section className="space-y-4 py-8">
            <div>
              <h2 className="font-semibold text-2xl">管理メニュー</h2>
              <p className="mt-1 text-sm text-slate-400">公開サイト上で扱えるモデレーター機能</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {operationCards.map((item) => {
                const Icon = item.icon
                return (
                  <Card
                    key={item.title}
                    className="rounded-[28px] border-white/10 bg-white/5 text-slate-100"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <Icon className="size-5 text-cyan-300" />
                        </div>
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-6 text-slate-400">{item.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          <Separator className="bg-white/10" />

          <section className="space-y-4 py-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-2xl">作品一覧（簡易）</h2>
                <p className="mt-1 text-sm text-slate-400">
                  最新6件を軽量表示。詳細操作は作品管理へ移動します。
                </p>
              </div>
              <Button asChild variant="secondary" className="bg-white/10 text-slate-100 hover:bg-white/20">
                <Link to="/admin/works">作品管理を開く</Link>
              </Button>
            </div>

            {worksPreviewLoading ? (
              <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
                <CardContent className="py-6 text-sm text-slate-300">読み込み中...</CardContent>
              </Card>
            ) : previewWorks.length === 0 ? (
              <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
                <CardContent className="py-6 text-sm text-slate-300">表示できる作品がありません。</CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {previewWorks.map((work: any) => (
                  <Link
                    key={work.id}
                    to="/admin/works"
                    className="rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                  >
                    <div className="flex items-start gap-3">
                      {work.smallThumbnailImageURL ? (
                        <img
                          src={work.smallThumbnailImageURL}
                          alt={work.title ?? "work"}
                          loading="lazy"
                          className="h-16 w-16 rounded-md border border-white/10 object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-md border border-white/10 text-xs text-slate-400">
                          no image
                        </div>
                      )}
                      <div className="min-w-0 space-y-1">
                        <p className="truncate font-medium text-sm text-white">{work.title || "(無題)"}</p>
                        <p className="text-xs text-slate-400">
                          #{work.id} / {work.type} / {work.accessType}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          投稿者: {work.user?.name ?? "-"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

const viewerQuery = gql`
  query AdminDashboardViewer {
    viewer {
      id
      isModerator
    }
  }
`

const adminCommentModerationItemsQuery = gql`
  query AdminDashboardCommentModerationItems {
    adminCommentModerationItems {
      id
      kind
    }
  }
`

const adminWorksPreviewQuery = gql`
  query AdminDashboardWorksPreview($offset: Int!, $limit: Int!) {
    works(offset: $offset, limit: $limit, where: {}) {
      id
      title
      type
      accessType
      smallThumbnailImageURL
      user {
        id
        name
      }
    }
  }
`
