import { AppPageCenter } from "@/components/app/app-page-center"
import { cn } from "@/lib/utils"

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
        "max-w-7xl mx-auto pb-16 pt-2 md:pt-4",
        "space-y-4 md:space-y-8",
        props.className,
      )}
    >
      {/* <Suspense fallback={<AppLoadingSpinner />}>{props.children}</Suspense> */}
      {props.children}
    </main>
  )
}
