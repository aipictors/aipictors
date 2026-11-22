import { cn } from "~/lib/utils"

/**
 * 設定のまとまり。見出し・説明・中身を 1 枚のカードにまとめる
 */
export function SettingsSection(props: {
  id?: string
  title?: string
  description?: string
  /** 見出しの右に置くもの（「すべて見る」など） */
  action?: React.ReactNode
  /** 見出しの左のアイコン */
  icon?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  const hasHeader = Boolean(props.title || props.description || props.action)
  return (
    <section
      id={props.id}
      className={cn(
        "scroll-mt-24 overflow-hidden rounded-2xl border bg-card shadow-sm",
        props.className,
      )}
    >
      {hasHeader && (
        <div className="flex items-start gap-3 border-b bg-muted/30 px-4 py-3.5 md:px-5">
          {props.icon && (
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary [&>svg]:size-4">
              {props.icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            {props.title && (
              <h2 className="font-semibold text-base leading-6">
                {props.title}
              </h2>
            )}
            {props.description && (
              <p className="mt-0.5 text-muted-foreground text-xs leading-5">
                {props.description}
              </p>
            )}
          </div>
          {props.action && <div className="shrink-0">{props.action}</div>}
        </div>
      )}
      <div className="px-4 py-4 md:px-5">{props.children}</div>
    </section>
  )
}

/**
 * 入力欄の見出し・補足・文字数をそろえる
 */
export function SettingsField(props: {
  htmlFor?: string
  label: string
  hint?: React.ReactNode
  /** 文字数の表示（例: 12 / 320） */
  count?: { value: number; max: number }
  className?: string
  children: React.ReactNode
}) {
  const isOver =
    props.count !== undefined && props.count.value > props.count.max
  return (
    <div className={cn("space-y-1.5", props.className)}>
      <div className="flex items-baseline justify-between gap-2">
        {props.htmlFor ? (
          <label htmlFor={props.htmlFor} className="font-medium text-sm">
            {props.label}
          </label>
        ) : (
          <p className="font-medium text-sm">{props.label}</p>
        )}
        {props.count && (
          <span
            className={cn(
              "text-muted-foreground text-xs tabular-nums",
              isOver && "text-destructive",
            )}
          >
            {props.count.value} / {props.count.max}
          </span>
        )}
      </div>
      {props.children}
      {props.hint && (
        <div className="text-muted-foreground text-xs leading-5">
          {props.hint}
        </div>
      )}
    </div>
  )
}

/**
 * スイッチの行。文字を押しても切り替わり、指で押しやすい高さにする
 */
export function SettingsSwitchRow(props: {
  htmlFor: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 py-2">
      <label htmlFor={props.htmlFor} className="min-w-0 flex-1 cursor-pointer">
        <span className="block font-medium text-sm leading-5">
          {props.title}
        </span>
        {props.description && (
          <span className="mt-0.5 block text-muted-foreground text-xs leading-5">
            {props.description}
          </span>
        )}
      </label>
      {props.children}
    </div>
  )
}

/**
 * 一覧が空のとき（ミュート・ブロックなど）
 */
export function SettingsEmptyState(props: {
  icon?: React.ReactNode
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-4 py-10 text-center">
      {props.icon && (
        <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground [&>svg]:size-5">
          {props.icon}
        </span>
      )}
      <p className="font-medium text-sm">{props.title}</p>
      {props.description && (
        <p className="max-w-sm text-muted-foreground text-xs leading-5">
          {props.description}
        </p>
      )}
    </div>
  )
}
