import { cn } from "~/lib/cn"

type Props = Readonly<{
  children: React.ReactNode
  className?: string
}>

/**
 * デフォルトのページのレイアウト
 */
export function AppPageCenter(props: Props) {
  return (
    <main className="flex w-full justify-center">
      <div
        className={cn(
          "mx-auto w-full max-w-screen-sm items-start justify-center overflow-x-hidden",
          "pt-2 pb-16 md:pt-0",
          "space-y-4 md:space-y-8",
          props.className,
        )}
      >
        {props.children}
      </div>
    </main>
  )
}
