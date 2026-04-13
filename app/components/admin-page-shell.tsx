import type { LucideIcon } from "lucide-react"
import {
  GripVertical,
  House,
  ImageIcon,
  LayoutGrid,
  MessageSquareWarning,
  ShieldAlert,
  Search,
  Shield,
  Users,
} from "lucide-react"
import { Link, useLocation } from "@remix-run/react"
import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
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
  {
    href: "/admin/reports",
    title: "作品通報一覧",
    description: "通報理由と対象作品を確認",
    icon: ShieldAlert,
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
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)
  const dragStateRef = useRef<{ startX: number; startWidth: number }>({
    startX: 0,
    startWidth: 320,
  })

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

  useEffect(() => {
    const savedWidth = window.localStorage.getItem("admin-sidebar-width")
    if (!savedWidth) {
      return
    }

    const parsedWidth = Number.parseInt(savedWidth, 10)
    if (Number.isFinite(parsedWidth)) {
      setSidebarWidth(Math.min(480, Math.max(0, parsedWidth)))
    }
  }, [])

  useEffect(() => {
    if (!isResizing) {
      return
    }

    const handlePointerMove = (event: MouseEvent) => {
      const nextWidth =
        dragStateRef.current.startWidth + (event.clientX - dragStateRef.current.startX)
      const clampedWidth = Math.min(480, Math.max(0, nextWidth))
      setSidebarWidth(clampedWidth)
    }

    const handlePointerUp = () => {
      setIsResizing(false)
      window.localStorage.setItem("admin-sidebar-width", String(sidebarWidth))
    }

    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
    window.addEventListener("mousemove", handlePointerMove)
    window.addEventListener("mouseup", handlePointerUp)

    return () => {
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      window.removeEventListener("mousemove", handlePointerMove)
      window.removeEventListener("mouseup", handlePointerUp)
    }
  }, [isResizing, sidebarWidth])

  const startResize = (event: React.MouseEvent<HTMLButtonElement>) => {
    dragStateRef.current = {
      startX: event.clientX,
      startWidth: sidebarWidth,
    }
    setIsResizing(true)
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#11182a_0%,#182235_100%)] text-slate-100">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6 lg:py-6">
        <aside
          className="w-full overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/35 p-4 backdrop-blur lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-[var(--admin-sidebar-width)] lg:min-w-0 lg:max-w-[480px] lg:overflow-auto"
          style={{ "--admin-sidebar-width": `${sidebarWidth}px` } as CSSProperties}
        >
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

          <div className="mb-4">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2 border-cyan-400/25 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20"
            >
              <Link to="/">
                <House className="size-4" />
                トップページへ
              </Link>
            </Button>
          </div>

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

        <button
          type="button"
          aria-label="左メニューの幅を調整"
          onMouseDown={startResize}
          className="hidden h-[calc(100vh-2rem)] w-3 shrink-0 cursor-col-resize items-center justify-center self-start rounded-full border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 lg:sticky lg:top-4 lg:flex"
        >
          <GripVertical className="size-4" />
        </button>

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

            <Button
              asChild
              variant="outline"
              className="border-cyan-400/25 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20"
            >
              <Link to="/">
                <House className="mr-2 size-4" />
                トップページへ
              </Link>
            </Button>
          </div>

          <div className="space-y-6 py-8">{props.children}</div>
        </main>
      </div>
    </div>
  )
}