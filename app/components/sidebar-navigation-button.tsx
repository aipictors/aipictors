import { buildLocalePath } from "~/utils/locale-path"
import { useLocation } from "@remix-run/react"
import { Link } from "~/lib/app/locale-router"
import clsx from "clsx"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { useSidebar } from "~/contexts/sidebar-context"

type Props = {
  href: string
  icon: LucideIcon
  children: ReactNode
  onClick?: () => void
  className?: string
  /** 外部サイト（別タブで開く） */
  isExternal?: boolean
}

/**
 * メニューの 1 行。アイコンの位置は開閉で変えず（中心はロゴ横の三本線と揃う）、
 * 閉じているときはホバーの背景がアイコンを中心にした正方形になる
 */
export function sidebarItemClassName(isExpanded: boolean) {
  return clsx(
    "ml-3 flex h-10 items-center rounded-lg px-2.5 font-medium text-sm transition-colors",
    isExpanded ? "mr-1" : "w-10",
  )
}

export function SidebarNavigationButton({
  href,
  icon: Icon,
  children,
  onClick,
  className,
  isExternal,
}: Props): React.ReactNode {
  const { pathname: rawPathname } = useLocation()
  // 英語のページでも同じ項目を選択中にする
  const pathname = buildLocalePath("ja", rawPathname)
  const { sidebarState } = useSidebar()
  const active = pathname === href || pathname.startsWith(`${href}/`)

  const showTooltip = sidebarState === "collapsed" || sidebarState === "minimal"

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={href}
            onClick={onClick}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            aria-label={
              sidebarState === "expanded" ? undefined : String(children)
            }
            aria-current={active ? "page" : undefined}
            className={clsx(
              sidebarItemClassName(sidebarState === "expanded"),
              active
                ? "bg-primary/10 font-semibold text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              className,
            )}
          >
            <Icon className="size-5 shrink-0" />
            {sidebarState === "expanded" && (
              <span className="ml-3 truncate">{children}</span>
            )}
          </Link>
        </TooltipTrigger>

        {showTooltip && (
          <TooltipContent side="right">{children}</TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
