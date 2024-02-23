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
      <div className="flex flex-col gap-y-4">
        <div>{props.submission}</div>
        <div className="flex flex-1 flex-col lg:flex-row gap-4 overflow-hidden">
          <div className="lg:min-w-64 xl:min-w-80">{props.config}</div>
          <div className="lg:min-w-64 xl:min-w-96 flex flex-col md:flex-row lg:flex-col gap-4">
            <div className="flex-1">{props.promptEditor}</div>
            <div className="min-w-80">{props.negativePromptEditor}</div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">{props.taskList}</div>
    </main>
  )
}
