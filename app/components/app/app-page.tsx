import { AppPageCenter } from "~/components/app/app-page-center"
import { useIsInsideMain } from "~/contexts/main-landmark-context"
import { cn } from "~/lib/utils"

type Props = Readonly<{
  children: React.ReactNode
  className?: string
  isCenter?: boolean
}>

/**
 * デフォルトのページのレイアウト
 */
export function AppPage (props: Props): React.ReactNode {
  const Tag = useIsInsideMain() ? "div" : "main"
  if (props.isCenter) {
    return <AppPageCenter {...props} />
  }

  return (
    <Tag
      className={cn(
        "container mx-auto pb-4",
        "space-y-4 overflow-x-hidden",
        props.className,
      )}
    >
      {props.children}
    </Tag>
  )
}
