import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import { useState } from "react"
import { Card } from "@/_components/ui/card"
import {} from "@/_components/ui/accordion"

type Props = {
  prompt: string | null
  negativePrompt: string | null
  steps: number | null
  scale: number | null
  seed: number | null
  sampler: string | null
  strength: string | null
  otherGenerationParams: string | null
}

/**
 * 作品詳細情報
 */
export const WorkArticleGenerationParameters = (props: Props) => {
  const [viewGenerationType, setViewGenerationType] = useState("prompt")

  if (
    !(
      props.otherGenerationParams ||
      props.prompt ||
      props.negativePrompt ||
      props.steps ||
      props.scale ||
      props.seed ||
      props.sampler ||
      props.strength
    )
  ) {
    return null
  }

  return (
    <>
      <Tabs value={viewGenerationType}>
        <TabsList>
          {props.prompt && (
            <TabsTrigger
              onClick={() => {
                setViewGenerationType("prompt")
              }}
              className="w-full"
              value="prompt"
            >
              Prompts
            </TabsTrigger>
          )}
          {props.negativePrompt && (
            <TabsTrigger
              onClick={() => {
                setViewGenerationType("negativePrompt")
              }}
              className="w-full"
              value="negativePrompt"
            >
              NegativePrompts
            </TabsTrigger>
          )}
          {(props.steps || props.scale || props.seed || props.sampler) && (
            <TabsTrigger
              onClick={() => {
                setViewGenerationType("parameter")
              }}
              className="w-full"
              value="parameter"
            >
              Parameter
            </TabsTrigger>
          )}
          {props.otherGenerationParams && (
            <TabsTrigger
              onClick={() => {
                setViewGenerationType("other")
              }}
              className="w-full"
              value="other"
            >
              Other
            </TabsTrigger>
          )}
        </TabsList>
        {props.prompt && (
          <TabsContent value="prompt">
            <Card className="m-0 max-h-32 overflow-y-auto whitespace-pre-wrap p-2">
              {props.prompt}
            </Card>
          </TabsContent>
        )}
        {props.negativePrompt && (
          <TabsContent value="negativePrompt">
            <Card className="m-0 max-h-32 overflow-y-auto whitespace-pre-wrap p-2">
              {props.negativePrompt}
            </Card>
          </TabsContent>
        )}
        {(props.steps || props.scale || props.seed || props.sampler) && (
          <TabsContent value="parameter">
            <Card className="m-0 max-h-32 overflow-y-auto whitespace-pre-wrap p-2">
              <div className="p-4">
                <div className="flex flex-wrap justify-between">
                  <div className="flex md:block">
                    <span className="block text-center text-sm opacity-50">
                      Steps
                    </span>
                    <span className="block text-center text-lg">
                      {props.steps}
                    </span>
                  </div>
                  <div className="flex md:block">
                    <span className="block text-center text-sm opacity-50">
                      Scale
                    </span>
                    <span className="block text-center text-lg">
                      {props.scale}
                    </span>
                  </div>
                  <div className="flex md:block">
                    <span className="block text-center text-sm opacity-50">
                      Seed
                    </span>
                    <span className="block text-center text-lg">
                      {props.seed}
                    </span>
                  </div>
                  <div className="flex md:block">
                    <span className="block text-center text-sm opacity-50">
                      Sampler
                    </span>
                    <span className="block text-center text-lg">
                      {props.sampler}
                    </span>
                  </div>
                  <div className="flex md:block">
                    <span className="block text-center text-sm opacity-50">
                      Strength
                    </span>
                    <span className="block text-center text-lg">
                      {props.strength}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        )}
        {props.otherGenerationParams && (
          <TabsContent value="other">
            <Card className="m-0 max-h-32 overflow-y-auto whitespace-pre-wrap p-2">
              {props.otherGenerationParams}
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </>
  )
}
