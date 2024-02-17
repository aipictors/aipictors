"use client"

import { GenerationTaskCacheView } from "@/app/[lang]/generation/tasks/[task]/_components/generation-task-cache-view"
import { ErrorResultCard } from "@/app/[lang]/generation/tasks/_components/error-result-card"
import { FallbackResultCard } from "@/app/[lang]/generation/tasks/_components/fallback-result-card"
import { GenerationResultCard } from "@/app/[lang]/generation/tasks/_components/generation-result-card"
import { Button } from "@/components/ui/button"
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
            {props.editMode === "edit" ? (
              <Button
                onClick={() => props.onSelectTask(task.nanoid, task.status)}
                className={
                  "bg-gray-300 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-800 hover:opacity-80 border-solid border-2 border-gray p-0 h-auto overflow-hidden rounded relative"
                }
              >
                <GenerationResultCard
                  taskNanoid={task.nanoid}
                  taskId={task.id}
                  token={task.token}
                  isSelected={props.selectedTaskIds.includes(task.nanoid ?? "")}
                />
              </Button>
            ) : null}
            {props.editMode !== "edit" &&
              (!isDesktop ? (
                <Link href={`/generation/tasks/${task.nanoid}`}>
                  <Button
                    className={
                      "bg-gray-300 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-800 hover:opacity-80 border-solid border-2 border-gray p-0 h-auto overflow-hidden rounded relative"
                    }
                  >
                    <GenerationResultCard
                      taskNanoid={task.nanoid}
                      taskId={task.id}
                      token={task.token}
                    />
                  </Button>
                </Link>
              ) : props.pcViewType === "dialog" ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className={
                        "bg-gray-300 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-800 hover:opacity-80 border-solid border-2 border-gray p-0 h-auto overflow-hidden rounded relative"
                      }
                    >
                      <GenerationResultCard
                        taskNanoid={task.nanoid}
                        taskId={task.id}
                        token={task.token}
                      />
                    </Button>
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
                    <Button
                      className={
                        "bg-gray-300 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-800 hover:opacity-80 border-solid border-2 border-gray p-0 h-auto overflow-hidden rounded relative"
                      }
                    >
                      <GenerationResultCard
                        taskNanoid={task.nanoid}
                        taskId={task.id}
                        token={task.token}
                      />
                    </Button>
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
