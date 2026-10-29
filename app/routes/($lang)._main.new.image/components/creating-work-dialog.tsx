import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Progress } from "~/components/ui/progress"

type Props = {
  isOpen: boolean
  progress: number // 0から100までの数値
  text?: string
}

export function CreatingWorkDialog (props: Props) {
  return (
    <>
      <Dialog open={props.isOpen}>
        <DialogContent className="w-64 space-y-8">
          <DialogHeader>
            <DialogTitle className="sr-only">
              {props.text ? props.text : "アップロード中"}
            </DialogTitle>
          </DialogHeader>
          {props.text ? (
            <p className="text-center text-sm text-muted-foreground">{props.text}</p>
          ) : (
            <p className="text-center text-sm text-muted-foreground">アップロード中</p>
          )}
          <Progress value={props.progress} className="w-[100%]" />
        </DialogContent>
      </Dialog>
    </>
  )
}
