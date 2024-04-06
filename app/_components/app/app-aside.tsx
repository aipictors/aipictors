import { ScrollArea } from "@/_components/ui/scroll-area"

type Props = {
  children: React.ReactNode
}

/**
 * ナビゲーション
 * ヘッダーのアイコンと同じ位置になるように左に余白を追加してます
 * @param props
 * @returns
 */
export const AppAside = (props: Props) => {
  return (
    <div className="sticky top-header">
      <ScrollArea className="-ml-3 hidden h-main w-48 min-w-48 overflow-y-auto pr-4 md:block">
        <nav className="pb-4">{props.children}</nav>
      </ScrollArea>
    </div>
  )
}
