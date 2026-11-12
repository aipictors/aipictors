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

type Props = {
  href: string
  icon: LucideIcon
  children: ReactNode
  onClick?: () => void
  className?: string
  /** ラベルの横に出す小さな印 */
  badge?: string
  /** 目立たせる項目（Aipictors+） */
  isAccent?: boolean
}

/**
 * ラベル表示ルール
 * ───────────────
 * xs-sm (<768 px) : 表示（inline）
 * md   (768-1023) : 非表示（hidden）
 * lg-  (>=1024 px): 再表示（inline）
 */
export function HomeMenuNavigationButton({
  href,
  icon: Icon,
  children,
  onClick,
  className,
  badge,
  isAccent,
}: Props) {
  const { pathname: rawPathname } = useLocation()
  // 英語のページでも同じ項目を選択中にする
  const pathname = buildLocalePath("ja", rawPathname)
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
                : isAccent
                  ? "font-semibold text-violet-700 hover:bg-violet-500/10 dark:text-violet-300"
                  : "text-muted-foreground hover:bg-muted/20 hover:text-foreground",
              // xs-sm 左寄せ → md 中央寄せ → lg- 左寄せ
              "justify-start lg:justify-start",
              className, // カスタムクラス名を追加
            )}
          >
            <Icon className="size-5 shrink-0" />
            <span className="ml-3 inline">{children}</span>
            {badge && (
              <span className="ml-2 shrink-0 rounded-full bg-fuchsia-600 px-1.5 py-0.5 font-bold text-[10px] text-white leading-none">
                {badge}
              </span>
            )}
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
