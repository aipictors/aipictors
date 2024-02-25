import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

type Props = {
  config: React.ReactNode
  promptEditor: React.ReactNode
  negativePromptEditor: React.ReactNode
  submission: React.ReactNode
  taskList: React.ReactNode
}

/**
 * エディタのレイアウト
 * @param props
 * @returns
 */
export const GenerationEditorLayout = (props: Props) => {
  return (
    <main className="flex flex-col lg:flex-row gap-4 lg:h-main pb-4 overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <div>{props.submission}</div>
          <div>{props.config}</div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel>{props.promptEditor}</ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>{props.negativePromptEditor}</ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel>{props.taskList}</ResizablePanel>
      </ResizablePanelGroup>
    </main>
  )
}
