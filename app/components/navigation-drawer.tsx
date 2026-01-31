import { Sheet, SheetContent, SheetOverlay } from "~/components/ui/sheet"

type Props = {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}

export function NavigationDrawer (props: Props): React.ReactNode {
  return (
    <Sheet>
      <SheetOverlay />
      <SheetContent>
        <div className="h-full overflow-auto bg-white p-4">
          {props.children}
        </div>
      </SheetContent>
    </Sheet>
  )
}
