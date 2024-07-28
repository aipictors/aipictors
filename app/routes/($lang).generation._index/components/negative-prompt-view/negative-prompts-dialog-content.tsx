import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NegativePromptCategoryIcon } from "@/routes/($lang).generation._index/components/negative-prompt-view/negative-prompt-category-icon"
import type { promptCategoryContextFragment } from "@/routes/($lang).generation._index/contexts/generation-query-context"
import type { FragmentOf } from "gql.tada"

type Props = {
  selectedNegativePromptIds: string[]
  onClose(): void
  negativePromptCategories: FragmentOf<typeof promptCategoryContextFragment>[]
  onSelect(id: string): void
}

export const NegativePromptsDialogContent = (props: Props) => {
  const defaultOpenCategories = props.negativePromptCategories
    .filter((category) =>
      category.prompts.some((prompt) =>
        props.selectedNegativePromptIds.includes(prompt.id),
      ),
    )
    .map((category) => category.id)

  return (
    <>
      <DialogContent className="md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
        <DialogHeader />
        <ScrollArea className="h-full max-h-[80vh] overflow-auto">
          <Accordion
            type="multiple"
            className="w-full pr-4"
            defaultValue={defaultOpenCategories}
          >
            {props.negativePromptCategories.map((promptCategory) => (
              <AccordionItem value={promptCategory.id} key={promptCategory.id}>
                <AccordionTrigger>
                  <div className="flex flex-col space-y-2">
                    <div className="flex gap-x-4">
                      <NegativePromptCategoryIcon name={promptCategory.name} />
                      <p>{promptCategory.name}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="flex flex-wrap gap-2">
                  {promptCategory.prompts.map((prompt) => (
                    <Button
                      variant={
                        props.selectedNegativePromptIds.includes(prompt.id)
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
          <Button className="w-full" onClick={props.onClose}>
            {"完了"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </>
  )
}
