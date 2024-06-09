import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/_components/ui/accordion"
import { Button } from "@/_components/ui/button"
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/_components/ui/dialog"
import { ScrollArea } from "@/_components/ui/scroll-area"
import type { negativePromptCategoriesQuery } from "@/_graphql/queries/negative-prompt-category/negative-prompt-category"
import { NegativePromptCategoryIcon } from "@/routes/($lang).generation._index/_components/negative-prompt-view/negative-prompt-category-icon"
import type { ResultOf } from "gql.tada"

type Props = {
  selectedNegativePromptIds: string[]
  onClose(): void
  negativePromptCategories: ResultOf<
    typeof negativePromptCategoriesQuery
  >["negativePromptCategories"]
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
      <DialogContent className="lg:max-w-screen-lg md:max-w-screen-md xl:max-w-screen-xl">
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
