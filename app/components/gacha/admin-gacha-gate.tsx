import { gql, useQuery } from "@apollo/client/index"
import type { LucideIcon } from "lucide-react"
import { type ReactNode, useContext } from "react"
import { AdminPageShell } from "~/components/admin-page-shell"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Card, CardContent } from "~/components/ui/card"
import { AuthContext } from "~/contexts/auth-context"
import { Link } from "~/lib/app/locale-router"

export const ADMIN_GACHA_CARD =
  "rounded-2xl border-white/10 bg-white/5 text-slate-100 shadow-none sm:rounded-[28px]"

const viewerQuery = gql`
  query AdminGachaViewer {
    viewer {
      id
      isModerator
    }
  }
`

const TABS = [
  { href: "/admin/gacha", title: "景品一覧" },
  { href: "/admin/gacha/simulator", title: "シミュレーション" },
] as const

type Props = {
  title: string
  description: string
  icon: LucideIcon
  current: (typeof TABS)[number]["href"]
  children: ReactNode
}

/** ガチャの管理ページの外枠。モデレーターだけ中身を見せる */
export function AdminGachaGate(props: Props) {
  const authContext = useContext(AuthContext)
  const { data, loading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })
  // 手元の開発サーバー（確認用に共有するとき）はログインなしで見せる。中身は固定の設定と抽選だけ
  const isDevPreview = import.meta.env.DEV
  const hasPermission = isDevPreview || Boolean(data?.viewer?.isModerator)

  const body = (() => {
    if (!isDevPreview && (authContext.isLoading || loading)) {
      return (
        <Card className={ADMIN_GACHA_CARD}>
          <CardContent className="py-8 text-slate-400 text-sm">
            読み込み中...
          </CardContent>
        </Card>
      )
    }
    if (!hasPermission) {
      return (
        <Alert className={ADMIN_GACHA_CARD}>
          <AlertDescription className="text-slate-300">
            {authContext.isNotLoggedIn
              ? "このページにアクセスするにはログインが必要です。"
              : "このページはモデレーターのみ利用できます。"}
          </AlertDescription>
        </Alert>
      )
    }
    return props.children
  })()

  return (
    <AdminPageShell
      title={props.title}
      description={props.description}
      icon={props.icon}
    >
      <div className="space-y-5 sm:space-y-6">
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              to={tab.href}
              className={
                tab.href === props.current
                  ? "rounded-full bg-white px-4 py-1.5 font-medium text-slate-900 text-sm"
                  : "rounded-full border border-white/15 px-4 py-1.5 text-slate-300 text-sm hover:bg-white/10"
              }
            >
              {tab.title}
            </Link>
          ))}
        </div>
        {body}
      </div>
    </AdminPageShell>
  )
}
