import { AppPageCenter } from "@/_components/app/app-page-center"
import { cn } from "@/_lib/utils"

type Props = {
  children: React.ReactNode
  className?: string
  isCenter?: boolean
}

/**
 * デフォルトのページのレイアウト
 * @param props
 * @returns
 */
export const AppPage = (props: Props) => {
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
