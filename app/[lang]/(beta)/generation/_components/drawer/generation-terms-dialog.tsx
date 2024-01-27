"use client"

import { AppMarkdown } from "@/components/app/app-markdown"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer"

type Props = {
  termsMarkdownText: string
  isDisabled?: boolean
  children: React.ReactNode
  onSubmit(): void
}

/**
 * 画像生成の利用規約のダイアログ
 * @param props
 * @returns
 */
export const GenerationTermsDialog = (props: Props) => {
  if (props.isDisabled) {
    return props.children
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"規約確認"}</DialogTitle>
        </DialogHeader>
        <AppMarkdown className="text-sm">{props.termsMarkdownText}</AppMarkdown>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button className="w-full" onClick={props.onSubmit}>
              同意する
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DialogContent>
    </Dialog>
  )
}
