import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

export const StickerModal = () => {
  const router = useRouter()

  const onClose = () => {
    router.back()
  }

  return (
    <Dialog
      open={true}
      onOpenChange={() => {
        onClose()
      }}
    >
      <DialogContent>
        <DialogHeader />
        <div>
          <p>{"新着"}</p>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>{"Close"}</Button>
          <Button variant="ghost">{"Secondary Action"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
