import { Dialog, DialogContent } from "@/_components/ui/dialog"
import { Progress } from "@/_components/ui/progress"

type Props = {
  isOpen: boolean
  progress: number // 0から100までの数値
  text?: string
}

export const CreatingWorkDialog = (props: Props) => {
  return (
    <>
      <Dialog open={props.isOpen}>
        <DialogContent className="w-64 space-y-8">
          {props.text ? (
            <p className="text-center text-sm opacity-50">{props.text}</p>
          ) : (
            <p className="text-center text-sm opacity-50">アップロード中</p>
          )}
          <Progress value={props.progress} className="w-[100%]" />
        </DialogContent>
      </Dialog>
    </>
  )
}
