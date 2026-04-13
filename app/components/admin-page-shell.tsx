import type { LucideIcon } from "lucide-react"
import {
  ImageIcon,
  LayoutGrid,
  MessageSquareWarning,
  Search,
  Shield,
  Users,
} from "lucide-react"
import { Link, useLocation } from "@remix-run/react"
import { type ReactNode, useMemo, useState } from "react"
import { Badge } from "~/components/ui/badge"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"

type AdminNavItem = {
  href: string
  title: string
  description: string
  icon: LucideIcon
}

const adminNavItems: readonly AdminNavItem[] = [
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

type Props = {
  title: string
  description: string
  icon?: LucideIcon
  children: ReactNode
}

export function AdminPageShell(props: Props) {
  const location = useLocation()
  const HeaderIcon = props.icon ?? Shield
  const [menuQuery, setMenuQuery] = useState("")

  const filteredNavItems = useMemo(() => {
    const normalizedQuery = menuQuery.trim().toLowerCase()

    if (normalizedQuery.length === 0) {
      return adminNavItems
    }

    return adminNavItems.filter((item) => {
      return [item.title, item.description, item.href]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    })
  }, [menuQuery])

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#11182a_0%,#182235_100%)] text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6 lg:py-6">
        <aside className="w-full rounded-[28px] border border-white/10 bg-slate-950/35 p-4 backdrop-blur lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-[320px] lg:overflow-auto">
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={menuQuery}
                onChange={(event) => setMenuQuery(event.target.value)}
                placeholder="メニューを検索"
                className="border-white/10 bg-white/5 pl-9 text-slate-200"
              />
            </div>
            <p className="text-xs text-slate-400">モデレーター専用メニュー</p>
          </div>

          <Separator className="my-4 bg-white/10" />

          <nav className="space-y-3">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isCurrent =
                item.href === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(item.href)

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

            {filteredNavItems.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
                一致するメニューがありません。
              </div>
            )}
          </nav>
        </aside>

        <main className="flex-1 rounded-[28px] border border-white/10 bg-slate-950/25 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <HeaderIcon className="size-7 text-cyan-300" />
                <h1 className="font-bold text-3xl tracking-tight">{props.title}</h1>
                <Badge variant="secondary" className="bg-white/10 text-slate-200">
                  noindex
                </Badge>
              </div>
              <p className="text-sm text-slate-400">{props.description}</p>
            </div>
          </div>

          <div className="space-y-6 py-8">{props.children}</div>
        </main>
      </div>
    </div>
  )
}