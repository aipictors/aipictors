import { CheckIcon, ImageOffIcon } from "lucide-react"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { toResizedImageUrl } from "~/utils/resized-image-url"

/**
 * 生成設定の部品。見た目をそろえるため、設定の項目はここの部品だけで組む
 * - 見出し: 太字＋(?)＋右に補足
 * - 選択肢: チップ（選択中はアクセントの薄い背景と枠）
 * - サムネで選ぶもの: 正方形のタイル
 * - 二次ボタン: 全幅のアウトライン
 */

/**
 * 選択中の色（生成ボタンと同じアクセント 1 色）
 */
export const configAccentSelected =
  "border-fuchsia-500/70 bg-fuchsia-500/10 text-fuchsia-700 dark:border-fuchsia-400/60 dark:bg-fuchsia-400/10 dark:text-fuchsia-200"

/**
 * アクセント色の文字リンク（プランへの案内など）
 */
export const configAccentLink =
  "text-fuchsia-600 hover:underline dark:text-fuchsia-300"

export function ConfigSectionHeader(props: {
  title: React.ReactNode
  tooltip?: string
  /**
   * 右に出す補足（0 / 2、1枚ずつ など）
   */
  aside?: React.ReactNode
  /**
   * 右に出す小さい操作（モデルを管理 など）
   */
  children?: React.ReactNode
}) {
  return (
    <div className="flex min-h-7 items-center gap-1.5">
      <h3 className="font-semibold text-sm">{props.title}</h3>
      {props.tooltip && <CrossPlatformTooltip text={props.tooltip} />}
      {(props.aside || props.children) && (
        <div className="ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap text-muted-foreground text-xs">
          {props.aside}
          {props.children}
        </div>
      )}
    </div>
  )
}

/**
 * 見出しの右に置く小さい操作
 */
export function ConfigHeaderAction(props: React.ComponentProps<typeof Button>) {
  return (
    <Button
      size="sm"
      variant="ghost"
      {...props}
      className={cn(
        "-my-1 h-7 gap-1 px-1.5 font-normal text-muted-foreground text-xs hover:text-foreground max-md:h-10 max-md:px-2 [&_svg]:size-3.5",
        props.className,
      )}
    />
  )
}

/**
 * チップ（比率・枚数・解像度・参照画像などの選択肢）
 */
export function configChipClass(options: {
  isSelected: boolean
  isDisabled?: boolean
  className?: string
}) {
  return cn(
    "flex min-h-9 min-w-0 items-center justify-center gap-1 rounded-lg border px-2 text-sm transition-colors max-md:min-h-11",
    options.isSelected
      ? cn(configAccentSelected, "font-semibold")
      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
    options.isDisabled &&
      "cursor-not-allowed opacity-45 hover:bg-background hover:text-muted-foreground",
    options.className,
  )
}

type ThumbTileProps = {
  imageUrl: string | null
  label: string
  isSelected?: boolean
  /**
   * 左上の小さいバッジ（ピックアップ など）
   */
  badge?: React.ReactNode
  title?: string
  /**
   * タイルの右上の操作（外す など）。タイル本体とは別のボタンにする
   */
  action?: React.ReactNode
  children?: React.ReactNode
}

/**
 * 正方形のサムネのタイル（モデル・LoRA）
 * 中身は onClick のボタンか、asChild で渡したリンク
 */
export function ConfigThumbTile(
  props: ThumbTileProps &
    (
      | { onClick(): void; onMouseEnter?(): void; render?: never }
      | {
          onClick?: never
          onMouseEnter?: never
          /**
           * リンクなどで包むとき（className を受け取って描画する）
           */
          render(className: string, content: React.ReactNode): React.ReactNode
        }
    ),
) {
  const className = "group flex w-full flex-col gap-1 text-left"
  const content = (
    <>
      <span
        className={cn(
          "relative block aspect-square w-full overflow-hidden rounded-lg border-2 bg-muted transition-colors",
          props.isSelected
            ? "border-fuchsia-500 dark:border-fuchsia-400"
            : "border-transparent group-hover:border-border",
        )}
      >
        {props.imageUrl ? (
          <img
            src={toResizedImageUrl(props.imageUrl, 160)}
            alt=""
            className="size-full object-cover"
            draggable={false}
            loading="lazy"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            {props.children ?? <ImageOffIcon className="size-5" />}
          </span>
        )}
        {props.badge && (
          <span className="absolute top-1 left-1 rounded bg-background/90 px-1 py-0.5 font-semibold text-[10px] text-fuchsia-700 leading-none shadow-xs dark:text-fuchsia-300">
            {props.badge}
          </span>
        )}
        {props.isSelected && (
          <span className="absolute right-1 bottom-1 flex size-4 items-center justify-center rounded-full bg-fuchsia-500 text-white">
            <CheckIcon className="size-3" strokeWidth={3} />
          </span>
        )}
      </span>
      <span
        className={cn(
          "block truncate text-[11px] leading-4",
          props.isSelected
            ? "font-semibold text-foreground"
            : "text-muted-foreground group-hover:text-foreground",
        )}
      >
        {props.label}
      </span>
    </>
  )

  return (
    <div className="relative min-w-0" title={props.title ?? props.label}>
      {props.render ? (
        props.render(className, content)
      ) : (
        <button
          type="button"
          onClick={props.onClick}
          onMouseEnter={props.onMouseEnter}
          aria-pressed={props.isSelected}
          className={className}
        >
          {content}
        </button>
      )}
      {props.action && (
        <span className="absolute top-1 right-1">{props.action}</span>
      )}
    </div>
  )
}

/**
 * タイルを並べる枠（幅に合わせて列数を変える）
 */
export function ConfigThumbGrid(props: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2">
      {props.children}
    </div>
  )
}

/**
 * 全幅のアウトラインボタン（すべてのモデルを見る など）
 */
export function ConfigWideButton(props: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="outline"
      {...props}
      className={cn(
        "h-9 w-full gap-1.5 rounded-lg font-medium text-sm [&_svg]:size-4",
        props.className,
      )}
    />
  )
}
