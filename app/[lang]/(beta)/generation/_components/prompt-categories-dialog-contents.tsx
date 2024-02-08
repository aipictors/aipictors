"use client"

import { PromptCategoryIcon } from "@/app/[lang]/(beta)/generation/_components/prompt-category-icon"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogHeader } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PromptCategoriesQuery } from "@/graphql/__generated__/graphql"

type Props = {
  selectedPromptIds: string[]
  onClose(): void
  promptCategories: PromptCategoriesQuery["promptCategories"]
  onSelect(id: string): void
}

export const PromptCategoriesDialogContents = (props: Props) => {
  const defaultOpenCategories = props.promptCategories
    .filter((category) =>
      category.prompts.some((prompt) =>
        props.selectedPromptIds.includes(prompt.id),
      ),
    )
    .map((category) => category.id)

  return (
    <>
      <DialogContent className="md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
        <DialogHeader />
        <ScrollArea className="h-full max-h-96">
          <Accordion
            type="multiple"
            className="w-full"
            defaultValue={defaultOpenCategories}
          >
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
      </DialogContent>
    </>
  )
}
