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
        className="fixed top-4 left-8 z-50 hidden pl-2 md:block"
        variant={"ghost"}
        size={"icon"}
        onClick={props.onToggle}
      >
        <MenuIcon className="h-6 w-6" />
      </Button>
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
