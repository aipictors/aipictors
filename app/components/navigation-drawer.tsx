import { Sheet, SheetContent, SheetOverlay } from "~/components/ui/sheet"

type Props = {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}

export const NavigationDrawer = (props: Props) => {
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
