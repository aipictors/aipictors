import { ResizablePanelWithMemory } from "~/components/resizable-panel-with-memory"
import { ResizableHandle, ResizablePanelGroup } from "~/components/ui/resizable"
import { Separator } from "~/components/ui/separator"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  config: React.ReactNode
  promptEditor: React.ReactNode
  settingLanguageUsedForPromptView: React.ReactNode
  negativePromptEditor: React.ReactNode
  taskDetails: React.ReactNode
  submissionView: React.ReactNode
  /**
   * スマホでいちばん上に出すプロンプト入力
   */
  mobilePromptEditor: React.ReactNode
}

/**
 * 画像生画面のメイン部分
 */
export function GenerationMainView (props: Props) {
  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  /**
   * スマホの場合リサイザーなし
   */
  if (!useMediaQuery("(min-width: 768px)")) {
    return (
      <div className="flex flex-col gap-4">
        {props.mobilePromptEditor}
        <div>{props.config}</div>
        <div className="pb-4">
          <Separator />
        </div>
      </div>
    )
  }

  /**
   * 履歴詳細表示モード
   */
  if (
    state === "HISTORY_LIST_FULL" ||
    state === "HISTORY_VIEW_ON_MAIN_AND_HEADER"
  ) {
    return props.taskDetails
  }

  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="flex flex-1 flex-col gap-4 overflow-hidden lg:flex-row"
      >
        <ResizablePanelWithMemory
          id="generation-main"
          className="flex flex-col gap-4 md:flex-row lg:min-w-40 lg:flex-col xl:min-w-40"
        >
          <ResizablePanelGroup
            direction="vertical"
            className="flex flex-col space-y-2"
          >
            {props.settingLanguageUsedForPromptView}
            <ResizablePanelWithMemory id="generation-editor">
              <div className="h-full flex-1 overflow-hidden">
                {props.promptEditor}
              </div>
            </ResizablePanelWithMemory>
            <ResizableHandle withHandle className="mt-2 mb-2" />
            <ResizablePanelWithMemory id="generation-negative">
              <div className="h-full flex-1 overflow-hidden">
                {props.negativePromptEditor}
              </div>
            </ResizablePanelWithMemory>
            <div className="flex flex-col">
              <Separator className="mt-2 mb-2" />
              {props.submissionView}
            </div>
          </ResizablePanelGroup>
        </ResizablePanelWithMemory>
      </ResizablePanelGroup>
    </>
  )
}
