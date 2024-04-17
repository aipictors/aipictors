import { Button } from "@/_components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/_components/ui/dialog"
import { useNavigate } from "@remix-run/react"

export const StickerModal = () => {
  const navigate = useNavigate()

  const onClose = () => {
    navigate(-1)
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
