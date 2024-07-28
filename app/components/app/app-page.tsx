import { AppPageCenter } from "@/components/app/app-page-center"
import { cn } from "@/lib/cn"

type Props = Readonly<{
  children: React.ReactNode
  className?: string
  isCenter?: boolean
}>

/**
 * デフォルトのページのレイアウト
 */
export function AppPage(props: Props) {
  if (props.isCenter) {
    return <AppPageCenter {...props} />
  }

  return (
    <main
      className={cn(
        "mx-auto w-full pb-4",
        "space-y-4 overflow-x-hidden",
        props.className,
      )}
    >
      {props.children}
    </main>
  )
}
