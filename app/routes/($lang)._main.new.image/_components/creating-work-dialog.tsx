import { Dialog, DialogContent } from "@/_components/ui/dialog"
import { Progress } from "@/_components/ui/progress"

type Props = {
  isOpen: boolean
  progress: number // 0から100までの数値
}

export const CreatingWorkDialog = (props: Props) => {
  return (
    <>
      <Dialog open={props.isOpen}>
        <DialogContent className="w-64 space-y-8">
          <p className="text-center text-sm opacity-50">アップロード中</p>
          <div className="m-auto h-4 w-4 animate-ping rounded-full bg-primary" />
          <Progress value={props.progress} className="w-[100%]" />
        </DialogContent>
      </Dialog>
    </>
  )
}
