"use client"

import { GenerationTaskCacheView } from "@/app/[lang]/generation/tasks/[task]/_components/generation-task-cache-view"
import { ErrorResultCard } from "@/app/[lang]/generation/tasks/_components/error-result-card"
import { FallbackResultCard } from "@/app/[lang]/generation/tasks/_components/fallback-result-card"
import { GenerationResultCard } from "@/app/[lang]/generation/tasks/_components/generation-result-card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { config } from "@/config"
import { ImageGenerationTaskNode } from "@/graphql/__generated__/graphql"
import { ErrorBoundary } from "@sentry/nextjs"
import Link from "next/link"
import { Suspense } from "react"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  tasks: ImageGenerationTaskNode[]
  editMode: string
  selectedTaskIds: string[]
  pcViewType: string
  onRestore?: (taskId: string) => void
  onSelectTask(taskNanoid: string | null, status: string): void
}

/**
 * 画像生成履歴の一覧
 * @param props
 * @returns
 */
export const GenerationEditorResultList = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <>
      {props.tasks.map((task) => (
        <ErrorBoundary key={task.id} fallback={ErrorResultCard}>
          <Suspense fallback={<FallbackResultCard />}>
            {props.editMode === "edit" && (
              <GenerationResultCard
                onClick={() => props.onSelectTask(task.nanoid, task.status)}
                isSelected={props.selectedTaskIds.includes(task.nanoid ?? "")}
                taskNanoid={task.nanoid}
                taskId={task.id}
                token={task.token}
              />
            )}
            {props.editMode !== "edit" &&
              (!isDesktop ? (
                <Link href={`/generation/tasks/${task.nanoid}`}>
                  <GenerationResultCard
                    taskNanoid={task.nanoid}
                    taskId={task.id}
                    token={task.token}
                  />
                </Link>
              ) : props.pcViewType === "dialog" ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <GenerationResultCard
                      taskNanoid={task.nanoid}
                      taskId={task.id}
                      token={task.token}
                    />
                  </DialogTrigger>
                  <DialogContent className="p-0 flex flex-col gap-0">
                    <Suspense fallback={<FallbackResultCard />}>
                      <GenerationTaskCacheView
                        isScroll={true}
                        task={task}
                        onRestore={props.onRestore}
                      />
                    </Suspense>
                  </DialogContent>
                </Dialog>
              ) : (
                <Sheet>
                  <SheetTrigger asChild>
                    <GenerationResultCard
                      taskNanoid={task.nanoid}
                      taskId={task.id}
                      token={task.token}
                    />
                  </SheetTrigger>
                  <SheetContent
                    side={"right"}
                    className="p-0 flex flex-col gap-0"
                  >
                    <Suspense fallback={<FallbackResultCard />}>
                      <GenerationTaskCacheView
                        task={task}
                        onRestore={props.onRestore}
                      />
                    </Suspense>
                  </SheetContent>
                </Sheet>
              ))}
          </Suspense>
        </ErrorBoundary>
      ))}
    </>
  )
}
