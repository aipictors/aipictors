"use client"

import { Sheet, SheetContent, SheetOverlay } from "@/components/ui/sheet"

type Props = {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}

export const NavigationDrawer: React.FC<Props> = (props) => {
  return (
    <Sheet>
      <SheetOverlay />
      <SheetContent>
        <div className="h-full overflow-auto p-4 bg-white">
          {props.children}
        </div>
      </SheetContent>
    </Sheet>
  )
}
