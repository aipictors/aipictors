"use client"

import { PromptCategoriesQuery } from "@/graphql/__generated__/graphql"
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

type Props = {
  selectedPromptIds: string[]
  isOpen: boolean
  onClose(): void
  promptCategories: PromptCategoriesQuery["promptCategories"]
  onSelect(id: string): void
}

export const PromptCategoriesDialog = (props: Props) => {
  //  {props.promptTexts.includes(prompt.name)}

  return (
    <Dialog
      open={props.isOpen}
      onOpenChange={() => {
        props.onClose()
      }}
    >
      <DialogContent className="md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
        <DialogHeader />
        <ScrollArea className="h-full max-h-96">
          <Accordion type="single" className="w-full">
            {props.promptCategories.map((promptCategory) => (
              <AccordionItem value={promptCategory.id} key={promptCategory.id}>
                <AccordionTrigger>
                  <div className="flex flex-col space-y-2">
                    <div className="flex gap-x-4">
                      <PromptCategoryIcon name={promptCategory.name} />
                      <p>{promptCategory.name}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="flex flex-wrap gap-2">
                  {promptCategory.prompts.map((prompt) => (
                    <Button
                      variant={
                        props.selectedPromptIds.includes(prompt.id)
                          ? "default"
                          : "secondary"
                      }
                      size={"sm"}
                      key={prompt.id}
                      onClick={() => {
                        props.onSelect(prompt.id)
                      }}
                    >
                      {prompt.name}
                    </Button>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
        <DialogFooter>
          <div className="flex flex-col">
            <p className="text-sm">{"※ 50個まで選択できます。"}</p>
            <Button
              onClick={props.onClose}
              // colorScheme="primary"
            >
              {"OK"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
