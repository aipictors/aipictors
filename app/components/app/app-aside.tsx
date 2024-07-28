import { ScrollArea } from "~/components/ui/scroll-area"

type Props = Readonly<{
  children: React.ReactNode
  isOpen: boolean
}>

/**
 * ナビゲーション
 * ヘッダーのアイコンと同じ位置になるように左に余白を追加してます
 */
export function AppAside(props: Props) {
  return (
    <>
      {props.isOpen && (
        <div className="fixed top-header hidden pl-8 md:block">
          <ScrollArea className="overflow-hidden">
            <nav>{props.children}</nav>
          </ScrollArea>
        </div>
      )}
    </>
  )
}
