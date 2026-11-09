import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { logError, logInfo } from "~/routes/($lang).generation._index/utils/client-diagnostics-logger"
import {
  createFluxImageGenerationTaskMutation,
  createGeminiImageGenerationTaskMutation,
  createImageGenerationTaskMutation,
  createImageGenerationTaskReservedMutation,
  viewerCurrentPassQuery,
} from "~/routes/($lang).generation._index/utils/generation-submit-queries"

/**
 * 生成タスクを作る mutation。失敗はトーストで伝える（コインの不足は案内を開く）
 */
export function useGenerationTaskMutations(props: {
  isDesktop: boolean
  setIsCoinShortageOpen: (isOpen: boolean) => void
}) {
  const { isDesktop, setIsCoinShortageOpen } = props

  const showError = (error: { message: string }) => {
    if (isDesktop) {
      toast.error(error.message)
    } else {
      toast.error(error.message, { position: "top-center" })
    }
  }

  const [createTask, { loading: isCreatingTask }] = useMutation(
    createImageGenerationTaskMutation,
    {
      refetchQueries: [viewerCurrentPassQuery],
      onCompleted() {
        logInfo({
          source: "GenerationSubmit",
          message: "createImageGenerationTask completed",
        })
      },
      onError(error) {
        logError({
          source: "GenerationSubmit",
          message: "createImageGenerationTask error",
          details: { name: error.name, message: error.message },
        })
        // コインが足りないときはトーストではなく、プラン・コイン購入の案内を出す
        if (error.message.includes("コイン残高が不足")) {
          setIsCoinShortageOpen(true)
          return
        }
        showError(error)
      },
    },
  )

  const [createFluxTask] = useMutation(createFluxImageGenerationTaskMutation, {
    refetchQueries: [viewerCurrentPassQuery],
    onCompleted() {
      logInfo({
        source: "GenerationSubmit",
        message: "createFluxTask completed",
      })
    },
    onError(error) {
      logError({
        source: "GenerationSubmit",
        message: "createFluxTask error",
        details: { name: error.name, message: error.message },
      })
      showError(error)
    },
  })

  const [createGeminiTask] = useMutation<{
    createGeminiImageGenerationTask: {
      id: string
      nanoid: string
      status: string
    }
  }>(createGeminiImageGenerationTaskMutation, {
    refetchQueries: [viewerCurrentPassQuery],
    onCompleted(data) {
      if (data?.createGeminiImageGenerationTask) {
        logInfo({
          source: "GenerationSubmit",
          message: "createGeminiTask completed",
          details: {
            id: data.createGeminiImageGenerationTask.id,
            status: data.createGeminiImageGenerationTask.status,
            nanoid: data.createGeminiImageGenerationTask.nanoid,
          },
        })
        toast("Geminiタスクが作成されました。完了後に結果が表示されます。", {
          position: isDesktop ? "bottom-right" : "top-center",
        })
      }
    },
    onError(error) {
      logError({
        source: "GenerationSubmit",
        message: "createGeminiTask error",
        details: { name: error.name, message: error.message },
      })
      // 理由を読めるように長めに出す（生成に時間がかかり、画面を見ていないことがある）
      toast.error(error.message, {
        duration: 12_000,
        ...(isDesktop ? {} : { position: "top-center" as const }),
      })
    },
  })

  const [createReservedTask] = useMutation(
    createImageGenerationTaskReservedMutation,
    {
      refetchQueries: [viewerCurrentPassQuery],
      onCompleted() {
        logInfo({
          source: "GenerationSubmit",
          message: "createReservedTask completed",
        })
      },
      onError(error) {
        logError({
          source: "GenerationSubmit",
          message: "createReservedTask error",
          details: { name: error.name, message: error.message },
        })
        showError(error)
      },
    },
  )

  return {
    createTask,
    isCreatingTask,
    createFluxTask,
    createGeminiTask,
    createReservedTask,
  }
}
