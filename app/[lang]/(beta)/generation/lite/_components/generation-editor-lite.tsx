"use client"

import { PromptCategoriesQuery } from "@/graphql/__generated__/graphql"
import { PromptCategoryIcon } from "@/app/[lang]/(beta)/generation/_components/prompt-category-icon"
import { Button } from "@/components/ui/button"
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
    <main className="flex justify-center w-full">
      <div className="max-w-[30rem] w-full p-4 space-y-8">
        <p className="font-bold text-2xl">{"画像生成"}</p>
        <div>
          {props.promptCategories.map((promptCategory) => (
            <div key={promptCategory.id}>
              <Button>
                <div className="flex-1 flex items-center space-x-2">
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
