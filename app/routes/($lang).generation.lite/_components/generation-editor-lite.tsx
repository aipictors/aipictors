import { Button } from "@/_components/ui/button"
import type { PromptCategoriesQuery } from "@/_graphql/__generated__/graphql"
import { PromptCategoryIcon } from "@/routes/($lang).generation._index/_components/prompt-view/prompt-category-icon"
import { useState } from "react"

type Props = {
  promptCategories: PromptCategoriesQuery["promptCategories"]
}

export const GenerationEditorLite = (props: Props) => {
  /**
   * 青色になっているカテゴリーのIDの配列
   */
  const [promptIds, setPromptIds] = useState<string[]>([])

  return (
    <main className="flex w-full justify-center">
      <div className="w-full max-w-[30rem] space-y-8 p-4">
        <p className="font-bold text-2xl">{"画像生成"}</p>
        <div>
          {props.promptCategories.map((promptCategory) => (
            <div key={promptCategory.id}>
              <Button>
                <div className="flex flex-1 items-center space-x-2">
                  <PromptCategoryIcon name={promptCategory.name} />
                  <p>{promptCategory.name}</p>
                  <p>
                    {promptCategory.prompts
                      .filter((prompt) => promptIds.includes(prompt.id))
                      .map((prompt) => {
                        return prompt.name
                      })
                      .join(",")}
                  </p>
                </div>
              </Button>
              <div className="pb-4">
                <div className="flex flex-wrap">
                  {promptCategory.prompts.map((prompt) => (
                    <Button
                      key={prompt.id}
                      onClick={() => {
                        const newPromptIds = promptIds.includes(prompt.id)
                          ? promptIds.filter((id) => id !== prompt.id)
                          : [...promptIds, prompt.id]
                        setPromptIds(newPromptIds)
                      }}
                    >
                      {prompt.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button>生成</Button>
      </div>
    </main>
  )
}
