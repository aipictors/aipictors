import { ScrollArea } from "@/_components/ui/scroll-area"

type Props = Readonly<{
  children: React.ReactNode
}>

/**
 * ナビゲーション
 * ヘッダーのアイコンと同じ位置になるように左に余白を追加してます
 */
export function AppAside(props: Props) {
  return (
    <div className="fixed top-header hidden h-main w-52 min-w-52 overflow-y-auto pl-8 md:block">
      <ScrollArea className="-ml-3 pr-4">
        <nav className="pb-8">{props.children}</nav>
      </ScrollArea>
    </div>
  )
}
