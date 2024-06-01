import { AppPageCenter } from "@/_components/app/app-page-center"
import { cn } from "@/_lib/cn"

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
        "mx-auto w-full pt-2 pb-8 md:pt-0",
        "space-y-8 md:space-y-8",
        "overflow-hidden",
        props.className,
      )}
    >
      {props.children}
    </main>
  )
}
