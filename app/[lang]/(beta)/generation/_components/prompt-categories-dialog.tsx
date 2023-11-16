"use client"

import { PromptCategoriesQuery } from "@/__generated__/apollo"
import { PromptCategoryIcon } from "@/app/[lang]/(beta)/generation/_components/prompt-category-icon"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

type Props = {
  isOpen: boolean
  onClose(): void
  promptCategories: PromptCategoriesQuery["promptCategories"]
  onSelect(id: string): void
}

export const PromptCategoriesDialog = (props: Props) => {
  const [promptIds, setPromptIds] = useState<string[]>([])

  return (
    <>
      <Dialog
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            props.onClose()
          }
        }}
        open={props.isOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader />
          <Accordion type="single" className="w-full">
            <ScrollArea className="h-72">
              {props.promptCategories.map((promptCategory) => (
                <AccordionItem
                  value={promptCategory.id}
                  key={promptCategory.id}
                >
                  <AccordionTrigger>
                    <div className="flex flex-col space-y-2">
                      <div className="flex">
                        <PromptCategoryIcon name={promptCategory.name} />
                        <p>{promptCategory.name}</p>
                      </div>
                      <div>
                        <AccordionContent>
                          {promptCategory.prompts.map((prompt) => (
                            <Button
                              variant={"secondary"}
                              key={prompt.id}
                              onClick={() => {
                                const newPromptIds = promptIds.includes(
                                  prompt.id,
                                )
                                  ? promptIds.filter((id) => id !== prompt.id)
                                  : [...promptIds, prompt.id]
                                setPromptIds(newPromptIds)
                              }}
                              // colorScheme={
                              //   promptIds.includes(prompt.id) ? "blue" : "gray"
                              // }
                              onSelect={() => {
                                props.onSelect(prompt.id)
                              }}
                              size={"sm"}
                              className="rounded-full"
                            >
                              {prompt.name}
                            </Button>
                          ))}
                        </AccordionContent>
                      </div>
                    </div>
                  </AccordionTrigger>
                </AccordionItem>
              ))}
            </ScrollArea>
          </Accordion>
          <DialogFooter className="justify-center">
            <div className="flex flex-col">
              <p className="text-sm">{"※ 50個まで選択できます。"}</p>
              <Button
                onClick={props.onClose}
                // colorScheme="primary"
                className="rounded-full"
              >
                {"OK"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
