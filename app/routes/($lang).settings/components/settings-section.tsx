import { cn } from "~/lib/utils"

/**
 * 設定のまとまり。見出しと枠
 */
export function SettingsSection(props: {
  title?: string
  description?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn("space-y-2", props.className)}>
      {props.title && <h2 className="font-bold text-sm">{props.title}</h2>}
      {props.description && (
        <p className="text-muted-foreground text-xs leading-5">
          {props.description}
        </p>
      )}
      <div className="rounded-xl border p-4">{props.children}</div>
    </section>
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
