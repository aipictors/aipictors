import { AppMarkdown } from "@/_components/app/app-markdown"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/_components/ui/alert-dialog"
import { Button } from "@/_components/ui/button"
import { ScrollArea } from "@/_components/ui/scroll-area"

type Props = {
  termsMarkdownText: string
  onSubmit(): void
  isLoading: boolean
  triggerChildren?: React.ReactNode
}

/**
 * 画像生成の利用規約のダイアログ
 */
export const GenerationTermsButton = (props: Props) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {props.triggerChildren ? (
          props.triggerChildren
        ) : (
          <Button disabled={props.isLoading} className="w-full">
            {props.isLoading ? "処理中.." : "生成"}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{"規約確認"}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          <ScrollArea className="h-64 w-full">
            <AppMarkdown>{props.termsMarkdownText}</AppMarkdown>
          </ScrollArea>
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>同意しない</AlertDialogCancel>
          <AlertDialogAction onClick={props.onSubmit}>
            同意する
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
