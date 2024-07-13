import { Button } from "@/_components/ui/button"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { MenuIcon } from "lucide-react"

type Props = Readonly<{
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}>

/**
 * ナビゲーション
 * ヘッダーのアイコンと同じ位置になるように左に余白を追加してます
 */
export function AppAside(props: Props) {
  return (
    <>
      <Button
        className="fixed top-4 left-4 z-50 hidden pl-1 md:block"
        variant={"ghost"}
        size={"icon"}
        onClick={props.onToggle}
      >
        <MenuIcon className="h-8 w-8" />
      </Button>
      {props.isOpen && (
        <div className="fixed top-header hidden h-main w-52 min-w-52 overflow-y-auto pl-8 md:block">
          <ScrollArea className="-ml-3 pr-4">
            <nav className="pb-8">{props.children}</nav>
          </ScrollArea>
        </div>
      )}
    </>
  )
}
