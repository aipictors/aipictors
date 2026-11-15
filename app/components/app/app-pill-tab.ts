import { cn } from "~/lib/utils"

/**
 * アプリと同じ丸いタブの見た目（トップ・作品一覧・タグ・検索・ユーザーページでそろえる）
 *
 * 高さは 40px（指で押しやすい大きさ）。並びは横にスクロールできるようにする
 */

/**
 * 丸いタブを並べる行（はみ出したら横にスクロール。スクロールバーは出さない）
 */
export const appPillRowClassName =
  "-mx-1 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"

/**
 * 切り替えのタブ（選んだものを塗る）
 */
export const appPillTabClassName = (isActive: boolean) =>
  cn(
    "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full px-4 font-bold text-sm transition-colors duration-200 active:scale-95 motion-reduce:transition-none",
    isActive
      ? "bg-foreground text-background"
      : "bg-muted text-foreground/75 hover:text-foreground",
  )

/**
 * 絞り込みのチップ（枠線。選んだものを塗る）
 */
export const appFilterChipClassName = (isActive: boolean) =>
  cn(
    "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-full border px-4 font-medium text-sm transition-colors active:scale-95 motion-reduce:transition-none",
    isActive
      ? "border-foreground bg-foreground text-background"
      : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
  )
