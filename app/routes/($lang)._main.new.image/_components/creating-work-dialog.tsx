import { Dialog, DialogContent } from "@/_components/ui/dialog"

type Props = {
  isOpen: boolean
}

export const CreatingWorkDialog = (props: Props) => {
  return (
    <>
      <Dialog open={props.isOpen}>
        <DialogContent className="w-64">
          <p className="text-center text-sm opacity-50">アップロード中</p>
          <div className="m-auto h-4 w-4 animate-ping rounded-full bg-primary" />
        </DialogContent>
      </Dialog>
    </>
  )
}
