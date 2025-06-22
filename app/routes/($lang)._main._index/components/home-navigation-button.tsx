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

type Props = {
  href: string
  icon: LucideIcon
  children: ReactNode
  onClick?: () => void
}

/**
 * ラベル表示ルール
 * ───────────────
 * xs-sm (<768 px) : 表示（inline）
 * md   (768-1023) : 非表示（hidden）
 * lg-  (>=1024 px): 再表示（inline）
 */
export function HomeNavigationButton({
  href,
  icon: Icon,
  children,
  onClick,
}: Props) {
  const { pathname } = useLocation()
  const active = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        {/* ボタン本体 */}
        <TooltipTrigger asChild>
          <Link
            to={href}
            onClick={onClick}
            className={clsx(
              "flex items-center rounded-md px-3 py-2 font-medium text-sm transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/20 hover:text-foreground",
              // xs-sm 左寄せ → md 中央寄せ → lg- 左寄せ
              "justify-start md:justify-center lg:justify-start",
            )}
          >
            <Icon className="size-5 shrink-0" />
            {/* xs-sm と lg- で表示 / md で隠す */}
            <span className="ml-3 inline md:hidden lg:inline">{children}</span>
          </Link>
        </TooltipTrigger>

        {/* ラベルが非表示になる md 幅だけツールチップを出す */}
        <TooltipContent side="right" className="hidden md:block lg:hidden">
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
