import { Link, useLocation } from "@remix-run/react"
import type { LucideIcon } from "lucide-react"
import clsx from "clsx"
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
}

export function SidebarNavigationButton({
  href,
  icon: Icon,
  children,
  onClick,
}: Props) {
  const { pathname } = useLocation()
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
            className={clsx(
              "flex items-center rounded-md px-3 py-2 font-medium text-sm transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/20 hover:text-foreground",
              // サイドバー状態に応じて配置を変更
              sidebarState === "expanded" ? "justify-start" : "justify-center",
            )}
          >
            <Icon className="size-5 shrink-0" />
            {sidebarState === "expanded" && (
              <span className="ml-3">{children}</span>
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
