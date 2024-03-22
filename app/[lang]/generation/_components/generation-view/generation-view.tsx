"use client"

import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { AuthContext } from "@/app/_contexts/auth-context"
import { AppLoadingPage } from "@/components/app/app-loading-page"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { config } from "@/config"
import { imageGenerationTaskQuery } from "@/graphql/queries/image-generation/image-generation-task"
import { skipToken, useSuspenseQuery } from "@apollo/client"
import { useSearchParams } from "next/navigation"
import { Suspense, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  header: React.ReactNode
  main: React.ReactNode
  aside: React.ReactNode
}

/**
 * 画像生成画面
 * @param props
 * @returns
 */
export const GenerationView = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  const authContext = useContext(AuthContext)

  const context = useGenerationContext()

  const searchParams = useSearchParams()

  const [isInitTask, setIsInitTask] = useState(false)

  const ref = searchParams.get("ref")

  const { data } = useSuspenseQuery(
    imageGenerationTaskQuery,
    authContext.isLoggedIn && ref
      ? {
          variables: {
            id: ref,
          },
        }
      : skipToken,
  )

  /**
   * URLのnanoidからタスクを復元
   */
  useEffect(() => {
    if (isInitTask) return
    if (data === undefined) return
    setIsInitTask(true)

    try {
      if (data?.imageGenerationTask) {
        const task = data.imageGenerationTask
        context.updateSettings(
          task.model.id,
          task.steps,
          task.model.type,
          task.sampler,
          task.scale,
          task.vae ?? "",
          task.prompt,
          task.negativePrompt,
          task.seed,
          task.sizeType,
          task.clipSkip,
        )
        toast("タスクを復元しました。")
      }
    } catch (error) {
      console.error(error)
    }
  }, [data])

  /**
   * スマホの場合リサイザーなし
   */
  if (!isDesktop) {
    return (
      <main className="flex flex-col gap-4 overflow-hidden pb-4 lg:h-main lg:flex-row">
        <div className="flex flex-col gap-y-4">
          {props.header}
          {props.main}
        </div>
        <div className="flex-1 overflow-hidden">{props.aside}</div>
      </main>
    )
  }

  if (state === "HISTORY_LIST_FULL") {
    return (
      <main className="flex flex-col gap-4 overflow-hidden pb-4 lg:h-main lg:flex-row">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel className="lg:min-w-80 xl:min-w-80">
            {props.aside}
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    )
  }

  return (
    <main className="flex flex-col gap-4 overflow-hidden pb-4 lg:h-main lg:flex-row">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel className="flex flex-col">
          <Suspense fallback={<AppLoadingPage />}>{props.header}</Suspense>
          <Suspense fallback={<AppLoadingPage />}>{props.main}</Suspense>
        </ResizablePanel>
        <ResizableHandle withHandle className="mr-4 ml-4" />
        <ResizablePanel className="lg:min-w-80 xl:min-w-80">
          <Suspense fallback={<AppLoadingPage />}>{props.aside}</Suspense>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  )
}
